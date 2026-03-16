using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ZoneOne.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSoftDeleteToBookings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "BookingChildren",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "BookingChildren");
        }
    }
}
