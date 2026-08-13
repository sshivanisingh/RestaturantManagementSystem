 
import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
 import { Button } from '../ui/button'
 import { CreditCard, Phone,MessageSquare  } from "lucide-react"
 const Advancefeaturemodel = ({openModel,setOpenModel,setIsPaymentModalOpen,handleCallNow}:any) => {

const WhatsAppIcon = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 32 32"
    fill="currentColor"
    {...props}
  >
    <path d="M16 2C8.268 2 2 8.268 2 16c0 2.838.828 5.478 2.26 7.686L2 30l6.524-2.196C10.61 29.326 13.204 30 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 24c-2.52 0-4.86-.822-6.776-2.38l-.482-.382-3.872 1.305 1.31-3.842-.394-.5A11.94 11.94 0 0 1 4 16c0-6.617 5.383-12 12-12s12 5.383 12 12-5.383 12-12 12zm6.18-8.553c-.338-.169-1.998-.986-2.31-1.097-.31-.11-.537-.168-.765.169-.225.334-.877 1.097-1.075 1.324-.198.223-.395.25-.733.084-.338-.169-1.427-.526-2.717-1.676-1.005-.896-1.683-2-1.88-2.338-.198-.334-.021-.515.148-.684.153-.151.338-.394.507-.592.169-.198.225-.334.338-.557.112-.223.056-.42-.028-.59-.084-.169-.765-1.847-1.047-2.528-.276-.662-.56-.573-.765-.584-.197-.011-.422-.014-.647-.014-.225 0-.59.084-.9.422-.31.334-1.18 1.152-1.18 2.807s1.208 3.25 1.376 3.476c.169.223 2.379 3.637 5.76 5.096.805.347 1.432.554 1.92.708.807.257 1.542.221 2.123.134.647-.097 1.998-.814 2.281-1.598.282-.783.282-1.451.197-1.598-.084-.145-.31-.23-.648-.4z" />
  </svg>
);


   return (
      <Dialog open={openModel} onOpenChange={setOpenModel}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-center justify-center">
              <CreditCard className="h-6 w-6 text-brand-primary" />
              Advanced Payment Features
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              For advanced payment method setup and premium features
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-6 py-4">
            <div className="w-20 h-20 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full flex items-center justify-center">
              <Phone className="h-10 w-10 text-white" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">Contact Our Support Team</h3>
              <p className="text-sm text-gray-600 max-w-sm">
                Please contact us for advanced payment features, custom integrations, and premium support.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 w-full text-center">
              <p className="text-sm text-gray-600 mb-2">Call us at:</p>
              <div className="text-2xl font-bold text-brand-primary mb-3">9027130674</div>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button
                  onClick={handleCallNow}
                  className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white"
                >
                  <WhatsAppIcon  className="mr-2 h-4 w-4" />
                  WhatsApp
                </Button>
                <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
            <div className="text-xs text-gray-500 text-center">Available Monday - Friday, 9:00 AM - 6:00 PM</div>
          </div>
        </DialogContent>
      </Dialog>
   )
 }
 
 export default Advancefeaturemodel