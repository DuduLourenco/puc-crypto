using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PucCrypto.Catalog.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "cryptocurrencies",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    symbol = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    coingecko_id = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_cryptocurrencies", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "user_cryptos",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    user_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    cryptocurrency_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    notes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    added_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_cryptos", x => x.id);
                    table.ForeignKey(
                        name: "FK_user_cryptos_cryptocurrencies_cryptocurrency_id",
                        column: x => x.cryptocurrency_id,
                        principalTable: "cryptocurrencies",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_cryptocurrencies_coingecko_id",
                table: "cryptocurrencies",
                column: "coingecko_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_user_cryptos_cryptocurrency_id",
                table: "user_cryptos",
                column: "cryptocurrency_id");

            migrationBuilder.CreateIndex(
                name: "IX_user_cryptos_user_id_cryptocurrency_id",
                table: "user_cryptos",
                columns: new[] { "user_id", "cryptocurrency_id" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "user_cryptos");

            migrationBuilder.DropTable(
                name: "cryptocurrencies");
        }
    }
}
