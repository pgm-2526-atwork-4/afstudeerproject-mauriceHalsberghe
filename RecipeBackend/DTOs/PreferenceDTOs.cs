namespace RecipeBackend.DTOs;

public class UpdateUserPreferencesDto
{
    public int? DietId { get; set; }
    public List<int> IngredientAllergyIds { get; set; } = [];
    public List<int> IngredientTypeAllergyIds { get; set; } = [];
    public bool FilterByDiet { get; set; }
    public bool FilterByAllergens { get; set; }
}