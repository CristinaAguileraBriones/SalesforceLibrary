import { LightningElement, api, wire, track } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import getBookDetails from '@salesforce/apex/BookDetailsController.getBookDetails';
import addToFavorites from '@salesforce/apex/BookDetailsController.addToFavorites';
import reserveBook from '@salesforce/apex/BookDetailsController.reserveBook';
import createOrGetLibro from '@salesforce/apex/BookDetailsController.createOrGetLibro';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class BookPage extends LightningElement {
    @track book;
    @track isLoading = true;
    @track error;
    @track isFavorite = false;
    @track isReserved = false;

    get favoriteIcon() {
        return this.isFavorite ? 'utility:favorite' : 'utility:like';
    }
    
    get favoriteAltText() {
        return this.isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos';
    }
    
    get reserveIcon() {
        return this.isReserved ? 'utility:lock' : 'utility:unlock';
    }
    
    get reserveAltText() {
        return this.isReserved ? 'Reservado' : 'Reservar';
    }

    @wire(CurrentPageReference)
    getStateParameters(currentPageReference) {
        if (currentPageReference && currentPageReference.state?.id) {
            const bookId = currentPageReference.state.id;
            this.loadBookDetails(bookId);
        }
    }

    loadBookDetails(bookId) {
        getBookDetails({ bookId: bookId })
            .then(result => {
                if (result) {
                    this.book = this.processBookData(result);
                    const info = this.book.volumeInfo;
                    createOrGetLibro({
                        googleBookId: this.book.id,
                        title: info.title || 'Sin título',
                        author: info.authors?.join(', ') || 'Autor desconocido',
                        description: info.description || 'Sin descripción',
                    })
                    .then(salesforceId => {
                        this.salesforceBookId = salesforceId;
                        console.log('salesforceId:', salesforceId);
                    })
                    .catch(error => {
                        this.error = error;
                        console.error('Error en createOrGetLibro:', error); 
                        this.showToast('Error', this.getErrorMessage(error), 'error');
                    });
                } else {
                    throw new Error('Libro no encontrado');
                }
            })
            .catch(error => {
                this.error = error;
                this.showToast('Error', error.message, 'error');
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    processBookData(book) {
        return {
            id: book.id,
            volumeInfo: {
                title: book.volumeInfo.title || 'Título desconocido',
                authors: this.formatAuthors(book.volumeInfo.authors),
                description: book.volumeInfo.description || 'Descripción no disponible',
                publishedDate: this.formatDate(book.volumeInfo.publishedDate),
                publisher: book.volumeInfo.publisher || 'Editorial desconocida',
                pageCount: book.volumeInfo.pageCount ? `${book.volumeInfo.pageCount} páginas` : 'Número de páginas no disponible',
                categories: this.formatCategories(book.volumeInfo.categories),
                imageLinks: {
                    thumbnail: book.volumeInfo.imageLinks?.thumbnail || '/assets/images/no-book-cover.png',
                    large: book.volumeInfo.imageLinks?.large || book.volumeInfo.imageLinks?.thumbnail
                }
            }
        };
    }

    formatAuthors(authors) {
        if (!authors) return ['Autor desconocido'];
        return Array.isArray(authors) ? authors : [authors];
    }

    formatDate(dateString) {
        if (!dateString) return 'Fecha desconocida';
        try {
            return new Date(dateString).toLocaleDateString();
        } catch (e) {
            return dateString;
        }
    }

    formatCategories(categories) {
        if (!categories) return ['Sin categorías'];
        return Array.isArray(categories) ? categories : [categories];
    }

    handleAddToFavorites() {
        if (this.isLoading) return;  
        this.isLoading = true;
        addToFavorites({ bookId: this.book.id, title: this.book.volumeInfo.title, author: this.book.volumeInfo.authors.join(', ') })
            .then(() => {
                this.isFavorite = !this.isFavorite;
                const message = this.isFavorite ? 'Añadido a favoritos' : 'Eliminado de favoritos';
                this.showToast('Éxito', message, 'success');
            })
            .catch(error => {
                const message = this.getErrorMessage(error);
                const isAlreadyFavorite = message.includes('ya está en tus favoritos');
                this.showToast(
                    isAlreadyFavorite ? 'Atención' : 'Error',
                    message,
                    isAlreadyFavorite ? 'warning' : 'error'
                );
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    handleReserveBook() {
        this.isLoading = true;
        if (!this.salesforceBookId) {
            console.error('Salesforce Book ID no está definido');
            this.showToast('Error', 'El libro aún no está listo para reservar. Intenta de nuevo en unos segundos.', 'error');
            this.isLoading = false;
            return;
        }
        reserveBook({ bookId: this.salesforceBookId })
            .then(() => {
                this.isReserved = true;
                this.showToast('Éxito', 'Libro reservado correctamente', 'success');
            })
            .catch(error => {
            console.error('Error al reservar libro:', error);
            const message = this.getErrorMessage(error);
            this.showToast('Error', message, 'error');
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({
            title,
            message,
            variant
        }));
    }
    getErrorMessage(error) {
        if (error?.body?.message) return error.body.message;
        if (error?.message) return error.message;
        return 'Error desconocido al crear el libro';
    }
}