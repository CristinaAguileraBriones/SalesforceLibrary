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
        User currentUser = [SELECT ContactId FROM User WHERE Id = :userId LIMIT 1];
        if (currentUser.ContactId == null) {
            throw new AuraHandledException('Este usuario no tiene un contacto asociado.');
        }
        Id contactId = currentUser.ContactId;
        List<Favorito__c> existingFavorites = [
            SELECT Id FROM Favorito__c 
            WHERE LibroId__c = :bookId AND Contact__c = :contactId
            LIMIT 1
        ];
        if (existingFavorites.isEmpty()) {
            Favorito__c fav = new Favorito__c();
            fav.LibroId__c = bookId;
            fav.Titulo__c = title;
            fav.Autor__c = author;
            fav.Contact__c = contactId;
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
        try {
            Id userId = UserInfo.getUserId();
            User user = [SELECT ContactId FROM User WHERE Id = :userId LIMIT 1];

            if (user.ContactId == null) {
                throw new AuraHandledException('El usuario no tiene un contacto asociado.');
            }

            Contact contacto = [SELECT Id FROM Contact WHERE Id = :user.ContactId LIMIT 1];
            Libro__c libro = [SELECT Id, Titulo__c FROM Libro__c WHERE Id = :bookId LIMIT 1];

            Date today = Date.today();
            Date fechaDevolucion = today.addDays(15);

            Reserva__c res = new Reserva__c(
                Libro__c = bookId,
                Contact__c = contacto.Id,
                Fecha_Reserva__c = today,
                Fecha_Devolucion__c = fechaDevolucion,
                Estado__c = 'Pendiente',
                Titulo_Libro_c__c = libro.Titulo__c
            );

            insert res;

        } catch (Exception e) {
            throw new AuraHandledException('Error al reservar el libro: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static List<Reserva__c> getReservations() {
        Id userId = UserInfo.getUserId();
        return [
            SELECT Id, Titulo_Libro_c__c, Fecha_Reserva__c, Fecha_Devolucion__c, Estado__c
            FROM Reserva__c
            WHERE CreatedById = :userId
            ORDER BY Fecha_Reserva__c DESC
        ];
    }

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

    @AuraEnabled
    public static void cancelReservation(Id reservaId) {
        try {
            Reserva__c res = [SELECT Id FROM Reserva__c WHERE Id = :reservaId LIMIT 1];
            delete res;
        } catch (Exception e) {
            throw new AuraHandledException('Error al cancelar la reserva: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static Id createOrGetLibro(String googleBookId, String title, String author, String description) {
        try {
            if (description != null && description.length() > 256) {
                description = description.substring(0, 256);  
            }
            List<Libro__c> existing = [SELECT Id FROM Libro__c WHERE GoogleBooks_ID__c = :googleBookId LIMIT 1];
    
            if (!existing.isEmpty()) {
                return existing[0].Id;
            }
    
            Libro__c libro = new Libro__c();
            libro.GoogleBooks_ID__c = googleBookId;
            libro.Titulo__c = title != null ? title : 'Sin título';
            libro.Autor__c = author != null ? author : 'Autor desconocido';
            libro.Descripcion__c = description != null ? description : 'Sin descripción';
    
            insert libro;
            return libro.Id;
    
        } catch (Exception e) {
            throw new AuraHandledException('Error al crear el libro: ' + e.getMessage());
        }
    }
}