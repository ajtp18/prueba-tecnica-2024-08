# Backend - Wompi Payment Gateway

Este proyecto es el backend de una aplicación que integra un gateway de pagos utilizando Wompi. Está construido con **NestJS** y se conecta a una base de datos **PostgreSQL**. Este backend maneja transacciones, productos, clientes y entregas, proporcionando una API robusta para la gestión de pagos y órdenes.

## Tabla de Contenidos

1. [Características](#características)
2. [Requisitos Previos](#requisitos-previos)
3. [Instalación](#instalación)
4. [Configuración](#configuración)
5. [Ejecución](#ejecución)
6. [Pruebas](#pruebas)
7. [Despliegue](#despliegue)
8. [Estructura del Proyecto](#estructura-del-proyecto)
9. [Contribución](#contribución)
10. [Licencia](#licencia)

## Características

- **Gestión de productos**: CRUD de productos en el sistema.
- **Gestión de transacciones**: Creación y actualización de transacciones con integración a Wompi.
- **Gestión de clientes**: Administración de clientes y sus métodos de pago.
- **Gestión de entregas**: Asociación de entregas con transacciones exitosas.
- **Swagger**: Documentación de la API disponible en `/api`.

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalados los siguientes requisitos:

- [Node.js](https://nodejs.org/) (v16 o superior)
- [npm](https://www.npmjs.com/) (v8 o superior)
- [Docker](https://www.docker.com/) (opcional, para despliegue y pruebas locales)
- [PostgreSQL](https://www.postgresql.org/) (v13 o superior)

## Instalación

Clona el repositorio en tu máquina local y navega al directorio del proyecto:

```bash
git clone https://github.com/tu-usuario/tu-repositorio.git
cd tu-repositorio/backend
### instala las dependencias
npm install
```

## Configuracion
Variables de Entorno: Crea un archivo .env en la raíz del proyecto con las siguientes variables:
env
Copiar código
- DB_HOST=db
- DB_PORT=5432
- DB_USERNAME=nestjs
- DB_PASSWORD=nestjs
- DB_NAME=nestjs

- WOMPI_BASE_URL=https://sandbox.wompi.co/v1
- WOMPI_PUBLIC_KEY=tu-public-key
- WOMPI_PRIVATE_KEY=tu-private-key
- WOMPI_SIGNATURE_KEY=tu-signature-key

**Configuración de la Base de Datos:** Asegúrate de que tu instancia de PostgreSQL esté corriendo y sea accesible con las credenciales proporcionadas en el archivo .env.

## Ejecucion
```bash
npm run start:dev
```

## Despliegue

El despliegue de esta aplicacion estaa lanzada en Render, tanto el backend como el frontend