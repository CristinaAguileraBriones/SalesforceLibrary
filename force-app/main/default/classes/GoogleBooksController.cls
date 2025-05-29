public with sharing class GoogleBooksController {
    
    @AuraEnabled
    public static List<Map<String, Object>> searchBooks(String searchTerm) {
        try {
            
            if (String.isBlank(searchTerm)) {
                throw new CalloutException('El término de búsqueda no puede estar vacío');
            }

            HttpRequest req = new HttpRequest();
            req.setEndpoint('https://www.googleapis.com/books/v1/volumes?q=' + 
                          EncodingUtil.urlEncode(searchTerm, 'UTF-8') + 
                          '&maxResults=20');
            req.setMethod('GET');
            req.setTimeout(10000); 
            
            Http http = new Http();
            HttpResponse res = http.send(req);
            
            if (res.getStatusCode() == 200) {
                Map<String, Object> response = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
                
                
                List<Object> items = (List<Object>) response.get('items');
                List<Map<String, Object>> books = new List<Map<String, Object>>();
                
                for (Object item : items) {
                    if (item instanceof Map<String, Object>) {
                        Map<String, Object> book = (Map<String, Object>) item;
                        Map<String, Object> volumeInfo = (Map<String, Object>)book.get('volumeInfo');
                        
                        // Estructura mínima garantizada con descripción
                        Map<String, Object> processedBook = new Map<String, Object>{
                            'id' => book.get('id'),
                            'volumeInfo' => new Map<String, Object>{
                                'title' => volumeInfo.get('title'),
                                'description' => volumeInfo.get('description'), // Nueva línea
                                'authors' => volumeInfo.get('authors'),
                                'imageLinks' => volumeInfo.get('imageLinks')
                            }
                        };
                        books.add(processedBook);
                    }
                }
                return books;
            } else {
                throw new CalloutException('Error en la API: ' + res.getStatusCode() + ' - ' + res.getStatus());
            }
        } catch (Exception e) {
            throw new CalloutException('Error procesando la respuesta: ' + e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<Map<String, Object>> getNewReleases() {
        try {
            HttpRequest req = new HttpRequest();
            req.setEndpoint('https://www.googleapis.com/books/v1/volumes?q=subject:fiction&orderBy=newest&maxResults=12');
            req.setMethod('GET');
            req.setTimeout(10000);
            
            Http http = new Http();
            HttpResponse res = http.send(req);
            
            if (res.getStatusCode() == 200) {
                Map<String, Object> response = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
                
                List<Object> items = (List<Object>) response.get('items');
                List<Map<String, Object>> books = new List<Map<String, Object>>();
                
                for (Object item : items) {
                    if (item instanceof Map<String, Object>) {
                        Map<String, Object> book = (Map<String, Object>) item;
                        Map<String, Object> volumeInfo = (Map<String, Object>)book.get('volumeInfo');
                        
                        books.add(new Map<String, Object>{
                            'id' => book.get('id'),
                            'volumeInfo' => new Map<String, Object>{
                                'title' => volumeInfo.get('title'),
                                'description' => volumeInfo.get('description'), 
                                'authors' => volumeInfo.get('authors'),
                                'imageLinks' => volumeInfo.get('imageLinks')
                            }
                        });
                    }
                }
                return books;
            } else {
                throw new CalloutException('Error en la API: ' + res.getStatusCode());
            }
        } catch (Exception e) {
            throw new CalloutException('Error al obtener novedades: ' + e.getMessage());
        }
    }
}