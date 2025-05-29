import { LightningElement, track } from 'lwc';
import getReservations from '@salesforce/apex/BookDetailsController.getReservations';
import cancelReservation from '@salesforce/apex/BookDetailsController.cancelReservation';

export default class ReservationsPage extends LightningElement {
    @track reservations = [];
    @track error;

    connectedCallback() {
        this.loadReservations();
    }

    async loadReservations() {
        try {
            const data = await getReservations();
            this.reservations = data.map(res => ({
                id: res.Id,
                title: res.Titulo_Libro_c__c,
                startDate: res.Fecha_Reserva__c,
                endDate: res.Fecha_Devolucion__c,
                status: res.Estado__c
            }));
        } catch (err) {
            console.error('Error al cargar reservas:', err);
            this.error = err;
        }
    }
    
    async cancelReservationHandler(event) {
      const reservaId = event.target.dataset.id;
      try {
          await cancelReservation({ reservaId });
          
          this.reservations = this.reservations.filter(res => res.id !== reservaId);
      } catch (error) {
          console.error('Error al cancelar la reserva:', error);
      }
  }
}
