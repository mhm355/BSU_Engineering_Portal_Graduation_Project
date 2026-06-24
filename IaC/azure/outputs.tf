output "resource_group_name" {
  description = "Name of the resource group"
  value       = azurerm_resource_group.main.name
}

output "vnet_id" {
  description = "ID of the Virtual Network"
  value       = azurerm_virtual_network.main.id
}

output "frontend_fqdn" {
  description = "FQDN of the frontend Container App"
  value       = azurerm_container_app.frontend.latest_revision_fqdn
}

output "backend_fqdn" {
  description = "FQDN of the backend Container App (internal)"
  value       = azurerm_container_app.backend.latest_revision_fqdn
}

output "mysql_fqdn" {
  description = "FQDN of the Azure Database for MySQL"
  value       = azurerm_mysql_flexible_server.main.fqdn
  sensitive   = true
}

output "acr_login_server" {
  description = "Login server for Azure Container Registry"
  value       = azurerm_container_registry.main.login_server
}

output "key_vault_uri" {
  description = "URI of the Key Vault"
  value       = azurerm_key_vault.main.vault_uri
}
