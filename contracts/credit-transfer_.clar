;; credit-transfer contract

(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_INVALID_CREDIT (err u101))

(define-map institution-credits { institution: principal, student: principal } uint)

(define-public (award-credits (student principal) (credits uint))
  (let ((current-credits (default-to u0 (map-get? institution-credits {institution: tx-sender, student: student}))))
    (map-set institution-credits {institution: tx-sender, student: student} (+ current-credits credits))
    (ok true)))

(define-public (transfer-credits (student principal) (credits uint) (to-institution principal))
  (let ((current-credits (default-to u0 (map-get? institution-credits {institution: tx-sender, student: student}))))
    (asserts! (>= current-credits credits) ERR_INVALID_CREDIT)
    (map-set institution-credits {institution: tx-sender, student: student} (- current-credits credits))
    (map-set institution-credits {institution: to-institution, student: student}
      (+ (default-to u0 (map-get? institution-credits {institution: to-institution, student: student})) credits))
    (ok true)))

(define-read-only (get-credits (institution principal) (student principal))
  (ok (default-to u0 (map-get? institution-credits {institution: institution, student: student}))))

