export const getAccessToken = (): string => process.env.ACCESS_TOKEN as string;
export const getAccessTime = (): number => process.env.ACCESS_TIME ? Number(process.env.ACCESS_TIME) : 900;
export const getRefreshToken = (): string => process.env.REFRESH_TOKEN as string
export const getRefreshTime = (): string => process.env.REFRESH_TIME as string