export interface GameRoom {
    id: string;
    roomNo: string;
    gameCategoryId: string;
    gameCategoryName: string;
    maxPlayers: number;
    ratePerHour: number;
    ratePerExtraPerson: number;
}
