using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ZoneOne.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveIconAndThemeColorFromCategory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IconUrl",
                table: "GameCategories");

            migrationBuilder.DropColumn(
                name: "ThemeColor",
                table: "GameCategories");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "IconUrl",
                table: "GameCategories",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ThemeColor",
                table: "GameCategories",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
