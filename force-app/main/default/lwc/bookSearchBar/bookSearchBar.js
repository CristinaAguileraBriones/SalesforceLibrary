import { LightningElement } from 'lwc';
import searchBooks from '@salesforce/apex/GoogleBooksController.searchBooks';

export default class BookSearchBar extends LightningElement {
    searchTerm = '';
    debounceTimeout;

    handleSearch(event) {
        this.searchTerm = event.target.value;
        clearTimeout(this.debounceTimeout);
        
        this.debounceTimeout = setTimeout(() => {
            if (this.searchTerm.length > 2) {
                this.searchBooks();
            } else {
                this.dispatchEvent(new CustomEvent('search', {
                    detail: { 
                        books: null,
                        searchTerm: this.searchTerm 
                    },
                    bubbles: true,
                    composed: true
                }));
            }
        }, 300);
    }

    searchBooks() {
        searchBooks({ searchTerm: this.searchTerm })
            .then(result => {
                this.dispatchEvent(new CustomEvent('search', {
                    detail: {
                        books: result,
                        searchTerm: this.searchTerm
                    },
                    bubbles: true,
                    composed: true
                }));
            })
            .catch(error => {
                console.error('Error en búsqueda:', error);
            });
    }
}