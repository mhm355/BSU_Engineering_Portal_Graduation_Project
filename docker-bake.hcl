variable "CACHE_TYPE" {
  default = "local"
}

variable "CACHE_DIR" {
  default = "./.docker-cache" 
}

function "cache_to" {
  params = [image_name]
  result = CACHE_TYPE == "registry" ? ["type=registry,ref=mhmdocker1/${image_name}:cache,mode=max"] : CACHE_TYPE == "local" ? ["type=local,dest=${CACHE_DIR}/${image_name},mode=max"] : []
}

function "cache_from" {
  params = [image_name]
  result = CACHE_TYPE == "registry" ? ["type=registry,ref=mhmdocker1/${image_name}:cache"] : CACHE_TYPE == "local" ? ["type=local,src=${CACHE_DIR}/${image_name}"] : []
}

group "default" {
  targets = ["backend", "frontend"]
}

target "base" {
  context = "."
  platforms = ["linux/amd64"]
}

target "backend" {
  inherits = ["base"]
  dockerfile = "backend-dockerfile"
  tags = ["mhmdocker1/bsu_backend:latest"]
  cache-to = cache_to("bsu_backend")
  cache-from = cache_from("bsu_backend")
}

target "frontend" {
  inherits = ["base"]
  context = "."
  dockerfile = "frontend-dockerfile"
  tags = ["mhmdocker1/bsu_frontend:latest"]
  cache-to = cache_to("bsu_frontend")
  cache-from = cache_from("bsu_frontend")
}