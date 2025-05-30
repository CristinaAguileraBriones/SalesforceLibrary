# 📚 Proyecto Biblioteca en Salesforce Experience Cloud

Este proyecto consiste en una plataforma de gestión de biblioteca desarrollada sobre Salesforce Experience Cloud, que permite a los usuarios autenticados buscar libros, realizar reservas, dejar reseñas y marcar libros como favoritos. Todo esto se presenta a través de una interfaz moderna, rápida y responsiva, basada en componentes Lightning Web Components (LWC).

---

## ⚙️ Tecnologías Utilizadas

- **Salesforce Experience Cloud**: Framework base para la creación del portal público y privado.
- **Apex**: Lógica del lado del servidor para controladores personalizados, validaciones y automatismos.
- **SOQL (Salesforce Object Query Language)**: Consulta eficiente de datos en la plataforma Salesforce.
- **Lightning Web Components (LWC)**: Creación de la interfaz de usuario con JavaScript moderno.
- **Salesforce CLI (SFDX)**: Despliegue, autenticación y gestión de entornos de desarrollo.
- **Visual Studio Code**: Editor principal, con el paquete de extensiones Salesforce Extension Pack.
- **Postman**: Pruebas de integraciones externas (OAuth, Google Books API).
- **GitHub**: Control de versiones, ramas y trabajo colaborativo.

---

## 🚀 Funcionalidades Principales

- 🔍 **Búsqueda de libros** a través de una barra de búsqueda dinámica conectada con la API de Google Books.
- 📖 **Visualización de detalles** de cada libro incluyendo título, autor, portada y disponibilidad.
- ⭐ **Sistema de favoritos**: los usuarios pueden marcar libros como favoritos para acceder rápidamente a ellos.
- 📝 **Reseñas**: los usuarios pueden comentar libros que han leído.
- 📅 **Reservas**: funcionalidad para reservar libros disponibles, con control de disponibilidad.
- 👤 **Perfil de usuario**: muestra historial de reservas, libros favoritos y reseñas realizadas.


---

## 🛠️ Próximas Mejoras

- 📬 **Automatización para administración**: Implementación de un trigger que envíe una notificación al administrador cada vez que se realice una reserva, permitiendo gestionar los préstamos sin revisión manual constante.
- 🕒 **Procesamiento Batch Asíncrono**: Para gestionar grandes volúmenes de reservas sin sobrecargar Salesforce, se plantea incorporar clases batch que manejen la creación y gestión de reservas en segundo plano.
- 🎨 **Mejoras en la interfaz**: Incorporación de diseño más atractivo y nuevas secciones como “Infantil”, y una zona de blog donde los usuarios puedan compartir recomendaciones o reseñas extendidas.


---

## 🧩 Estructura de Objetos Personalizados

- **Libro__c**: Título, autor, ISBN, disponibilidad.
- **Reserva__c**: Lookup a Usuario y Libro, con fecha de reserva y estado.
- **Favoritos__c**: Relación N:M entre Usuario y Libro para libros favoritos.


