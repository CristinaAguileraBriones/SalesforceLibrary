import { LightningElement, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation'; // Añade esta importación
import getNewReleases from '@salesforce/apex/GoogleBooksController.getNewReleases';

export default class bookSearch extends NavigationMixin(LightningElement) {
    @track newReleases = [];    // Almacena los 12 libros iniciales
    @track displayedBooks = []; // Libros a mostrar
    @track isLoading = true;
    @track cardTitle = 'Últimos Lanzamientos'; // Título dinámico

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

    // Procesa los datos para asegurar estructura consistente
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
            // Mostrar los 12 libros iniciales
            this.displayedBooks = this.newReleases;
            this.cardTitle = 'Últimos Lanzamientos';
        } else {
            // Mostrar resultados de búsqueda
            this.displayedBooks = this.processBookData(searchData.books);
            this.cardTitle = `Resultados para "${searchData.searchTerm}"`;
        }
    }

    toggleDescriptionExpansion(event) {
        event.stopPropagation(); // Añadir esto
        const bookId = event.target.dataset.id;
        const book = this.displayedBooks.find(b => b.id === bookId);

        if (book) {
            // Acceder a isDescriptionExpanded dentro de volumeInfo
            book.volumeInfo.isDescriptionExpanded = !book.volumeInfo.isDescriptionExpanded;
            this.displayedBooks = [...this.displayedBooks];
        }
    }

    handleBookClick(event) {
        // Verificación más robusta
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