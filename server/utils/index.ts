

/**
 * 从userId中解析数据
 * @param userId 
 * @param index 
 */
export const parseFromUserId = (userId: string, index: number): number =>{
    return +userId.split(/[sp]/)[index];
}
