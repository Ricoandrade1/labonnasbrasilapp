import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button";

interface PaymentDialogProps {
  paymentMethod: string | null;
  total: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({ paymentMethod, total, open, onOpenChange, onConfirm }) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white text-black">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-semibold">Finalizar Pagamento</AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-gray-500">
            Confirma o pagamento de **R$ {total.toFixed(2)}** por **{paymentMethod}**?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex justify-center space-x-4 mb-4">
          {paymentMethod === 'Dinheiro' && (
            <div className="flex flex-col items-center">
              {/* Ícone de Dinheiro (SVG inline) */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-green-500">
                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.5 6.75a.75.75 0 00-1.5 0v6a.75.75 0 001.5 0v-6zm3 0a.75.75 0 00-1.5 0v6a.75.75 0 001.5 0v-6z" clipRule="evenodd" />
              </svg>
              <p className="text-sm">Dinheiro</p>
            </div>
          )}
          {paymentMethod === 'MBWay' && (
            <div className="flex flex-col items-center">
              {/* Ícone de MBWay (SVG inline) */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-blue-500">
                <path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM9.75 15a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v2.25a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75V15zM15 15a.75.75 0 01.75-.75h.75a.75.75 0 01.75.75v2.25a.75.75 0 01-.75.75h-.75a.75.75 0 01-.75-.75V15zM8.47 7.97a.75.75 0 011.06 0l2.25 2.25a.75.75 0 01-1.06 1.06l-1.72-1.72V12a.75.75 0 01-1.5 0V9.56l-1.72 1.72a.75.75 0 11-1.06-1.06l2.25-2.25zM16.65 7.97a.75.75 0 00-1.06 0l-2.25 2.25a.75.75 0 001.06 1.06l1.72-1.72V12a.75.75 0 001.5 0V9.56l1.72 1.72a.75.75 0 101.06-1.06l-2.25-2.25z" />
              </svg>
              <p className="text-sm">MBWay</p>
            </div>
          )}
          {paymentMethod === 'MultiBanco' && (
            <div className="flex flex-col items-center">
              {/* Ícone de MultiBanco (SVG inline) */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-yellow-500">
                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.35-3.75a.75.75 0 00-1.2 0l-2.7 3a.75.75 0 001.2 1.5l1.95-2.17v2.925a.75.75 0 001.5 0v-4.5z" clipRule="evenodd" />
              </svg>
              <p className="text-sm">MultiBanco</p>
            </div>
          )}
        </div>
        <AlertDialogFooter className="sm:justify-start">
          <AlertDialogCancel asChild>
            <Button type="button" variant="secondary" className="bg-gray-200 text-gray-700 hover:bg-gray-300">
              Cancelar
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button type="submit" className="bg-green-500 text-white hover:bg-green-600">Confirmar Pagamento</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PaymentDialog;
