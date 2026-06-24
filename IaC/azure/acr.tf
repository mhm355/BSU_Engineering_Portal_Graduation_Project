# Azure Container Registry

resource "azurerm_container_registry" "main" {
  name                = "${var.project_name}acr${random_string.suffix.result}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = "Standard"
  admin_enabled       = false

  tags = {
    Name = "${var.project_name}-acr"
  }
}

# User Assigned Managed Identity for Container Apps to access ACR
resource "azurerm_user_assigned_identity" "container_apps" {
  name                = "${var.project_name}-container-apps-identity"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location

  tags = {
    Name = "${var.project_name}-container-apps-identity"
  }
}

# Role assignment for Container Apps identity to pull from ACR
resource "azurerm_role_assignment" "acr_pull" {
  scope                = azurerm_container_registry.main.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_user_assigned_identity.container_apps.principal_id
}
