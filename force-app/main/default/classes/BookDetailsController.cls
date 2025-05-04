public with sharing class BookDetailsController {
    @AuraEnabled
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
    public static void addToFavorites(String bookId, String title, String author) {
        Id userId = UserInfo.getUserId();
        Contact userContact = [
            SELECT Id FROM Contact
            WHERE OwnerId = :userId
            LIMIT 1
        ];
        
        List<Favorito__c> existingFavorites = [
            SELECT Id FROM Favorito__c 
            WHERE LibroId__c = :bookId AND Contact__c = :userContact.Id
            LIMIT 1
        ];
        
        if (existingFavorites.isEmpty()) {
            Favorito__c fav = new Favorito__c();
            fav.LibroId__c = bookId;
            fav.Titulo__c = title;
            fav.Autor__c = author;
            fav.Contact__c = userContact.Id; 
            try {
                insert fav;  
            } catch (DmlException e) {
                throw new AuraHandledException('Error al agregar a favoritos: ' + e.getMessage());
            }
        } else {
            throw new AuraHandledException('Este libro ya está en tus favoritos.');
        }
    }

    @AuraEnabled
    public static void reserveBook(String bookId) {
        String userId = UserInfo.getUserId();
        Reserva__c res = new Reserva__c(
            Libro__c = bookId,
            Contact__c = userId,
            Fecha_Reserva__c = Date.today(),
            Estado__c = 'Pendiente'
        );
        insert res;
    }
    //@AuraEnabled
    //public static List<Favorito__c> getFavorites() {
        //Id userId = UserInfo.getUserId();
        //User u = [SELECT ContactId FROM User WHERE Id = :userId LIMIT 1];
        //if (u.ContactId == null) {
            //throw new AuraHandledException('No se encontró un contacto asociado al usuario actual.');
        //}
        //return [
            //SELECT Id, Titulo__c, Autor__c, LibroId__c 
            //FROM Favorito__c 
            //WHERE Contact__c = :u.ContactId
        //];
    //}
    @AuraEnabled
    public static List<Favorito__c> getFavorites() {
        Id userId = UserInfo.getUserId();
        return [
            SELECT Id, Titulo__c, Autor__c, LibroId__c 
            FROM Favorito__c 
            WHERE CreatedById = :userId
        ];
    }
    @AuraEnabled
    public static void updateReview(Id favoritoId, String resena) {
        Favorito__c fav = [SELECT Id FROM Favorito__c WHERE Id = :favoritoId LIMIT 1];
        fav.Resena__c = resena;
        update fav;
    }
    @AuraEnabled
    public static void deleteReview(Id favoritoId) {
        Favorito__c favorito = [SELECT Id, Resena__c FROM Favorito__c WHERE Id = :favoritoId LIMIT 1];
        favorito.Resena__c = null;  
        update favorito;  
    }
}