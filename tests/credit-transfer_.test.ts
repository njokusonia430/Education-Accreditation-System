import { describe, it, expect, beforeEach } from 'vitest';

// Mock contract state
let institutionCredits = new Map<string, number>();

// Mock contract functions
const awardCredits = (institution: string, student: string, credits: number) => {
  const key = `${institution}-${student}`;
  const currentCredits = institutionCredits.get(key) || 0;
  institutionCredits.set(key, currentCredits + credits);
  return { type: 'ok', value: true };
};

const transferCredits = (fromInstitution: string, student: string, credits: number, toInstitution: string) => {
  const fromKey = `${fromInstitution}-${student}`;
  const toKey = `${toInstitution}-${student}`;
  const currentCredits = institutionCredits.get(fromKey) || 0;
  
  if (currentCredits < credits) {
    return { type: 'err', value: 101 }; // ERR_INVALID_CREDIT
  }
  
  institutionCredits.set(fromKey, currentCredits - credits);
  const toCredits = institutionCredits.get(toKey) || 0;
  institutionCredits.set(toKey, toCredits + credits);
  
  return { type: 'ok', value: true };
};

const getCredits = (institution: string, student: string) => {
  const key = `${institution}-${student}`;
  return { type: 'ok', value: institutionCredits.get(key) || 0 };
};

describe('Credit Transfer Contract', () => {
  beforeEach(() => {
    institutionCredits.clear();
  });
  
  it('should award credits to a student', () => {
    const result = awardCredits('institution1', 'student1', 30);
    expect(result.type).toBe('ok');
    expect(result.value).toBe(true);
    
    const credits = getCredits('institution1', 'student1');
    expect(credits.type).toBe('ok');
    expect(credits.value).toBe(30);
  });
  
  it('should accumulate credits when awarded multiple times', () => {
    awardCredits('institution1', 'student1', 30);
    awardCredits('institution1', 'student1', 20);
    
    const credits = getCredits('institution1', 'student1');
    expect(credits.type).toBe('ok');
    expect(credits.value).toBe(50);
  });
  
  it('should transfer credits between institutions', () => {
    awardCredits('institution1', 'student1', 50);
    const transferResult = transferCredits('institution1', 'student1', 30, 'institution2');
    
    expect(transferResult.type).toBe('ok');
    expect(transferResult.value).toBe(true);
    
    const creditsInst1 = getCredits('institution1', 'student1');
    const creditsInst2 = getCredits('institution2', 'student1');
    
    expect(creditsInst1.type).toBe('ok');
    expect(creditsInst1.value).toBe(20);
    expect(creditsInst2.type).toBe('ok');
    expect(creditsInst2.value).toBe(30);
  });
  
  it('should fail to transfer more credits than available', () => {
    awardCredits('institution1', 'student1', 30);
    const transferResult = transferCredits('institution1', 'student1', 50, 'institution2');
    
    expect(transferResult.type).toBe('err');
    expect(transferResult.value).toBe(101); // ERR_INVALID_CREDIT
    
    const creditsInst1 = getCredits('institution1', 'student1');
    const creditsInst2 = getCredits('institution2', 'student1');
    
    expect(creditsInst1.type).toBe('ok');
    expect(creditsInst1.value).toBe(30);
    expect(creditsInst2.type).toBe('ok');
    expect(creditsInst2.value).toBe(0);
  });
  
  it('should allow transferring all credits', () => {
    awardCredits('institution1', 'student1', 30);
    const transferResult = transferCredits('institution1', 'student1', 30, 'institution2');
    
    expect(transferResult.type).toBe('ok');
    expect(transferResult.value).toBe(true);
    
    const creditsInst1 = getCredits('institution1', 'student1');
    const creditsInst2 = getCredits('institution2', 'student1');
    
    expect(creditsInst1.type).toBe('ok');
    expect(creditsInst1.value).toBe(0);
    expect(creditsInst2.type).toBe('ok');
    expect(creditsInst2.value).toBe(30);
  });
  
  it('should handle multiple students and institutions', () => {
    awardCredits('institution1', 'student1', 30);
    awardCredits('institution1', 'student2', 40);
    awardCredits('institution2', 'student1', 20);
    
    transferCredits('institution1', 'student1', 10, 'institution2');
    transferCredits('institution1', 'student2', 15, 'institution3');
    
    expect(getCredits('institution1', 'student1').value).toBe(20);
    expect(getCredits('institution2', 'student1').value).toBe(30);
    expect(getCredits('institution1', 'student2').value).toBe(25);
    expect(getCredits('institution3', 'student2').value).toBe(15);
  });
  
  it('should return 0 credits for a student with no records', () => {
    const credits = getCredits('institution1', 'nonexistent_student');
    expect(credits.type).toBe('ok');
    expect(credits.value).toBe(0);
  });
});

