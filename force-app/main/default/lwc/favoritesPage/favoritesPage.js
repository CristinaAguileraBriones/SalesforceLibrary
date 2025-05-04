import { LightningElement, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getFavorites from '@salesforce/apex/BookDetailsController.getFavorites';
import updateReview from '@salesforce/apex/BookDetailsController.updateReview';
import deleteReview from '@salesforce/apex/BookDetailsController.deleteReview';  // Asegúrate de importar deleteReview

export default class FavoritesPage extends NavigationMixin(LightningElement) {
    @track favorites = [];
    @track isLoading = true;
    @track error;

    async connectedCallback() {
        await this.loadFavorites();
    }

    async loadFavorites() {
        try {
            this.isLoading = true;
            const data = await getFavorites();

            this.favorites = data.map(fav => {
                const hasReview = !!fav.Resena__c;
                return {
                    ...fav,
                    Resena__c: fav.Resena__c,
                    review: fav.Resena__c,
                    saveDisabled: !hasReview,  
                    editDisabled: !hasReview,  
                    deleteDisabled: !hasReview,
                    readonly: hasReview
                };
            });

            this.error = undefined;
        } catch (error) {
            this.error = error;
            console.error('Error al cargar favoritos:', error);
        } finally {
            this.isLoading = false;
        }
    }

    handleReviewChange(event) {
        const favoritoId = event.target.dataset.id;
        const value = event.target.value;

        this.favorites = this.favorites.map(fav => {
            if (fav.Id === favoritoId) {
                const hasChanged = value !== fav.Resena__c;
                return {
                    ...fav,
                    review: value,
                    saveDisabled: !hasChanged 
                };
            }
            return fav;
        });
    }

    async saveReview(event) {
        const favoritoId = event.target.dataset.id;
        const fav = this.favorites.find(f => f.Id === favoritoId);

        try {
            await updateReview({ favoritoId: fav.Id, resena: fav.review });

            this.favorites = this.favorites.map(f => {
                if (f.Id === favoritoId) {
                    return {
                        ...f,
                        Resena__c: f.review,  
                        saveDisabled: true,    
                        editDisabled: false,  
                        deleteDisabled: false,
                        readonly: true  
                    };
                }
                return f;
            });
        } catch (error) {
            console.error('Error al guardar la reseña:', error);
        }
    }

    editReview(event) {
        const favoritoId = event.target.dataset.id;

        this.favorites = this.favorites.map(fav => {
            if (fav.Id === favoritoId) {
                return {
                    ...fav,
                    saveDisabled: false, 
                    editDisabled: true,
                    readonly: false    
                };
            }
            return fav;
        });
    }

    async deleteReview(event) {
        const favoritoId = event.target.dataset.id;

        try {
            await deleteReview({ favoritoId: favoritoId });

            this.favorites = this.favorites.map(fav => {
                if (fav.Id === favoritoId) {
                    return {
                        ...fav,
                        Resena__c: null,  
                        review: '',       
                        saveDisabled: true, 
                        editDisabled: false, 
                        deleteDisabled: true,
                        readonly: false 
                    };
                }
                return fav;
            });
        } catch (error) {
            console.error('Error al eliminar la reseña:', error);
        }
    }

    navigateToBook(event) {
        const bookId = event.currentTarget.dataset.bookid;

        this[NavigationMixin.Navigate]({
            type: 'standard__navItemPage',
            attributes: {
                apiName: 'Book_Page'
            },
            state: {
                id: bookId
            }
        });
    }
}
