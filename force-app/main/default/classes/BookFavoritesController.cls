public with sharing class BookFavoritesController {
    @AuraEnabled(cacheable=true)
    public static List<Book_Favorite__c> getFavorites() {
        return [SELECT Book_Data__c FROM Book_Favorite__c 
                WHERE User__c = :UserInfo.getUserId()];
    }
}