public class CreateInventoryIngredientDto
{
    public int UserId { get; set; }
    public int? Quantity { get; set; }
    public int? QuantityUnitId { get; set; }
    public int IngredientId { get; set; }
}

public class CreateListIngredientDto
{
    public int UserId { get; set; }
    public int IngredientId { get; set; }
    public int? Quantity { get; set; }
    public int? QuantityUnitId { get; set; }
}