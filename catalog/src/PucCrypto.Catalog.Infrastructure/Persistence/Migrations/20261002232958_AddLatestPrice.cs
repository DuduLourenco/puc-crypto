using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PucCrypto.Catalog.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddLatestPrice : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "latest_price_at",
                table: "cryptocurrencies",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "latest_price_usd",
                table: "cryptocurrencies",
                type: "decimal(28,10)",
                precision: 28,
                scale: 10,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "latest_price_at",
                table: "cryptocurrencies");

            migrationBuilder.DropColumn(
                name: "latest_price_usd",
                table: "cryptocurrencies");
        }
    }
}
