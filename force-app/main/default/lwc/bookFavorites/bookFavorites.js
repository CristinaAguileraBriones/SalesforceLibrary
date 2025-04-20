import { LightningElement, wire, track } from 'lwc';
import getFavorites from '@salesforce/apex/BookFavoritesController.getFavorites';

export default class BookFavorites extends LightningElement {
    @track favorites = [];

    @wire(getFavorites)
    loadFavorites({ data, error }) {
        if (data) {
            this.favorites = data;
        }
    }
}