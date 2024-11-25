;; course-completion contract

(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_ALREADY_COMPLETED (err u101))
(define-constant ERR_INVALID_COURSE (err u102))

(define-data-var next-course-id uint u0)

(define-map courses uint
  {
    institution: principal,
    name: (string-ascii 100),
    criteria: (string-ascii 1000)
  }
)

(define-map completions { student: principal, course-id: uint } bool)

(define-public (create-course (name (string-ascii 100)) (criteria (string-ascii 1000)))
  (let ((course-id (var-get next-course-id)))
    (map-set courses course-id
      {
        institution: tx-sender,
        name: name,
        criteria: criteria
      }
    )
    (var-set next-course-id (+ course-id u1))
    (ok course-id)))

(define-public (complete-course (course-id uint) (student principal))
  (let ((course (unwrap! (map-get? courses course-id) ERR_INVALID_COURSE)))
    (asserts! (is-eq tx-sender (get institution course)) ERR_UNAUTHORIZED)
    (asserts! (is-none (map-get? completions {student: student, course-id: course-id})) ERR_ALREADY_COMPLETED)
    (map-set completions {student: student, course-id: course-id} true)
    (ok true)))

(define-read-only (get-course (course-id uint))
  (ok (unwrap! (map-get? courses course-id) ERR_INVALID_COURSE)))

(define-read-only (is-course-completed (course-id uint) (student principal))
  (ok (default-to false (map-get? completions {student: student, course-id: course-id}))))

