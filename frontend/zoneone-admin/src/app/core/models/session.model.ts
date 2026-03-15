export interface SessionDto {
    id: string;
    gameRoomId: string;
    roomNo: string;
    gameCategoryId: string;
    categoryName: string;
    startTime: string;
    endTime?: string | null;
    numberOfPersons: number;
    hourlyRate: number;
    totalAmount: number;
}
