import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class HeaderMessage extends NavigationMixin(LightningElement) {
    handleGoHome() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/home'
            }
        });
    }
}