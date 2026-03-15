using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ZoneOne.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBookingMasterChild : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Sessions");

            migrationBuilder.CreateTable(
                name: "BookingMasters",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CustomerName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    CustomerPhone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TotalPayment = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PaymentStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BookingMasters", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BookingChildren",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BookingMasterId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    GameRoomId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    GameCategoryId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StartTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TotalPersons = table.Column<int>(type: "int", nullable: false),
                    TableRate = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BookingChildren", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BookingChildren_BookingMasters_BookingMasterId",
                        column: x => x.BookingMasterId,
                        principalTable: "BookingMasters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BookingChildren_GameCategories_GameCategoryId",
                        column: x => x.GameCategoryId,
                        principalTable: "GameCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BookingChildren_GameRooms_GameRoomId",
                        column: x => x.GameRoomId,
                        principalTable: "GameRooms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BookingChildren_BookingMasterId",
                table: "BookingChildren",
                column: "BookingMasterId");

            migrationBuilder.CreateIndex(
                name: "IX_BookingChildren_GameCategoryId",
                table: "BookingChildren",
                column: "GameCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_BookingChildren_GameRoomId",
                table: "BookingChildren",
                column: "GameRoomId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BookingChildren");

            migrationBuilder.DropTable(
                name: "BookingMasters");

            migrationBuilder.CreateTable(
                name: "Sessions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    GameCategoryId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    GameRoomId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EndTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    HourlyRate = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    NumberOfPersons = table.Column<int>(type: "int", nullable: false),
                    StartTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TotalAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sessions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Sessions_GameCategories_GameCategoryId",
                        column: x => x.GameCategoryId,
                        principalTable: "GameCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Sessions_GameRooms_GameRoomId",
                        column: x => x.GameRoomId,
                        principalTable: "GameRooms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Sessions_GameCategoryId",
                table: "Sessions",
                column: "GameCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Sessions_GameRoomId",
                table: "Sessions",
                column: "GameRoomId");
        }
    }
}
