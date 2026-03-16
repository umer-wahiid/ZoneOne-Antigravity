using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ZoneOne.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBookingMasterSoftDelete : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "BookingMasters",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "BookingMasters");
        }
    }
}
