import { LightningElement, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation'; // Añade esta importación
import getNewReleases from '@salesforce/apex/GoogleBooksController.getNewReleases';

export default class bookSearch extends NavigationMixin(LightningElement) {
    @track newReleases = [];    
    @track displayedBooks = []; 
    @track isLoading = true;
    @track cardTitle = 'Últimos Lanzamientos'; 

    connectedCallback() {
        this.loadInitialBooks();
    }

    loadInitialBooks() {
        getNewReleases()
            .then(result => {
                this.newReleases = this.processBookData(result);
                this.displayedBooks = this.newReleases;
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    processBookData(books) {
        return books.map(book => {
            return {
                id: book.id,
                volumeInfo: {
                    title: book.volumeInfo.title || 'Título desconocido',
                    authors: book.volumeInfo.authors || [],
                    description: book.volumeInfo.description || 'Descripción no disponible',
                    imageLinks: {
                        thumbnail: book.volumeInfo.imageLinks?.thumbnail || '/assets/images/no-book-cover.png'
                    },
                truncatedDescription: book.volumeInfo.description?.slice(0, 200) || '', 
                isDescriptionExpanded: false 
                }
            };
        });
    }

    handleSearch(event) {
        const searchData = event.detail;
        
        if (searchData.books === null) {
            
            this.displayedBooks = this.newReleases;
            this.cardTitle = 'Últimos Lanzamientos';
        } else {
            
            this.displayedBooks = this.processBookData(searchData.books);
            this.cardTitle = `Resultados para "${searchData.searchTerm}"`;
        }
    }

    toggleDescriptionExpansion(event) {
        event.stopPropagation(); 
        const bookId = event.target.dataset.id;
        const book = this.displayedBooks.find(b => b.id === bookId);

        if (book) {
            
            book.volumeInfo.isDescriptionExpanded = !book.volumeInfo.isDescriptionExpanded;
            this.displayedBooks = [...this.displayedBooks];
        }
    }

    handleBookClick(event) {
        
        if (!event.target.closest('button')) {
            event.preventDefault();
            const bookId = event.currentTarget.dataset.id;
            
            try {
                this[NavigationMixin.Navigate]({
                    type: 'standard__webPage',
                    attributes: {
                        url: `/booksdetails?id=${bookId}`
                    }
                });
            } catch (error) {
                console.error('Navigation error:', error);
            }
        }
    }
}