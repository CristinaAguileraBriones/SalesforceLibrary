public with sharing class BookDetailsController {
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getBookDetails(String bookId) {
        try {
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint('https://www.googleapis.com/books/v1/volumes/' + bookId);
            request.setMethod('GET');
            
            HttpResponse response = http.send(request);
            
            if (response.getStatusCode() == 200) {
                return (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
            } else {
                throw new AuraHandledException('Error al obtener detalles del libro: ' + response.getStatus());
            }
        } catch (Exception e) {
            throw new AuraHandledException('Error en la conexión: ' + e.getMessage());
        }
    }
    @AuraEnabled
    public static void addToFavorites(String bookId) {
        // Implementación para añadir a favoritos
        // Ejemplo básico:
        String userId = UserInfo.getUserId();
        
        // Verificar si ya existe en favoritos
        List<Favorito__c> existingFavorites = [
            SELECT Id FROM Favorito__c 
            WHERE 	Libro__c = :bookId AND Contact__c = :userId
            LIMIT 1
        ];
        
        if (existingFavorites.isEmpty()) {
            // Crear nuevo favorito
            Favorito__c fav = new Favorito__c(
                Libro__c = bookId,
                Contact__c = userId
            );
            insert fav;
        } else {
            // Eliminar favorito existente
            delete existingFavorites;
        }
    }
    
    @AuraEnabled
    public static void reserveBook(String bookId) {
        // Implementación para reservar libro
        // Ejemplo básico:
        String userId = UserInfo.getUserId();
        
        Reserva__c res = new Reserva__c(
            Libro__c = bookId,
            Contact__c = userId,
            Fecha_Reserva__c = Date.today(),
            Estado__c = 'Pendiente'
        );
        insert res;
    }
}