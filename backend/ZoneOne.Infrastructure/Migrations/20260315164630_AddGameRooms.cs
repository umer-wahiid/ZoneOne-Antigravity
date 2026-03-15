using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ZoneOne.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddGameRooms : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "GameRooms",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RoomNo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    GameCategoryId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MaxPlayers = table.Column<int>(type: "int", nullable: false),
                    RatePerHour = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    RatePerExtraPerson = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GameRooms", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GameRooms_GameCategories_GameCategoryId",
                        column: x => x.GameCategoryId,
                        principalTable: "GameCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GameRooms_GameCategoryId",
                table: "GameRooms",
                column: "GameCategoryId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GameRooms");
        }
    }
}
