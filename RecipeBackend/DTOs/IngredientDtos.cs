using System.Security.Cryptography.X509Certificates;

public class CreateInventoryIngredientDto
{
    public int UserId { get; set; }
    public decimal? Quantity { get; set; }
    public int? QuantityUnitId { get; set; }
    public int IngredientId { get; set; }
}

public class CreateListIngredientDto
{
    public int UserId { get; set; }
    public int IngredientId { get; set; }
    public decimal? Quantity { get; set; }
    public int? QuantityUnitId { get; set; }
}

public class DeleteListIngredientsDto
{
    public int UserId { get; set; }
    public List<int> Ids { get; set; }
}

public record UpdateInventoryIngredientDto(
    string IngredientName,
    decimal? Quantity,
    int? QuantityUnitId
);