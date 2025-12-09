import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, MapPin, CreditCard, Users, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Provider, useAppStore } from '@/store/useAppStore';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface BookingModalProps {
  provider: Provider;
  isOpen: boolean;
  onClose: () => void;
}

type BookingStep = 'datetime' | 'details' | 'confirm' | 'success';

export function BookingModal({ provider, isOpen, onClose }: BookingModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { userLocation } = useAppStore();
  const [step, setStep] = useState<BookingStep>('datetime');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');
  const [isGroupBooking, setIsGroupBooking] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ];

  const estimatedCost = provider.hourlyRate * 2; // Assume 2 hours

  const handleNext = () => {
    if (step === 'datetime') {
      if (!selectedDate || !selectedTime) {
        toast({
          title: 'Please select date and time',
          variant: 'destructive'
        });
        return;
      }
      setStep('details');
    } else if (step === 'details') {
      setStep('confirm');
    } else if (step === 'confirm') {
      handleConfirmBooking();
    }
  };

  const handleBack = () => {
    if (step === 'details') setStep('datetime');
    else if (step === 'confirm') setStep('details');
  };

  const handleConfirmBooking = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setStep('success');
  };

  const handleClose = () => {
    setStep('datetime');
    setSelectedDate(undefined);
    setSelectedTime('');
    setIsGroupBooking(false);
    setSpecialInstructions('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={provider.avatar}
                    alt={provider.name}
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-lg">{provider.name}</h3>
                    <p className="text-muted-foreground text-sm">
                      ₹{provider.hourlyRate}{t('providers.perHour')}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={handleClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Progress */}
              {step !== 'success' && (
                <div className="flex gap-2 mt-4">
                  {['datetime', 'details', 'confirm'].map((s, i) => (
                    <div
                      key={s}
                      className={`flex-1 h-1 rounded-full ${
                        ['datetime', 'details', 'confirm'].indexOf(step) >= i
                          ? 'accent-gradient'
                          : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <AnimatePresence mode="wait">
                {step === 'datetime' && (
                  <motion.div
                    key="datetime"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <Label className="flex items-center gap-2 mb-3">
                        <Calendar className="w-4 h-4" />
                        {t('booking.selectDateTime')}
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start">
                            <Calendar className="w-4 h-4 mr-2" />
                            {selectedDate ? format(selectedDate, 'PPP') : 'Select date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <Label className="flex items-center gap-2 mb-3">
                        <Clock className="w-4 h-4" />
                        Select Time
                      </Label>
                      <div className="grid grid-cols-4 gap-2">
                        {timeSlots.map((time) => (
                          <Button
                            key={time}
                            variant={selectedTime === time ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedTime(time)}
                            className={selectedTime === time ? 'accent-gradient text-accent-foreground' : ''}
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 'details' && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <Label className="flex items-center gap-2 mb-3">
                        <MapPin className="w-4 h-4" />
                        Service Location
                      </Label>
                      <Input
                        value={userLocation?.address || 'Current Location'}
                        readOnly
                        className="bg-muted"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-accent" />
                        <div>
                          <p className="font-medium">{t('booking.groupBooking')}</p>
                          <p className="text-sm text-muted-foreground">
                            {t('booking.groupBookingDesc')}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={isGroupBooking}
                        onCheckedChange={setIsGroupBooking}
                      />
                    </div>

                    <div>
                      <Label className="mb-3 block">{t('booking.specialInstructions')}</Label>
                      <Textarea
                        placeholder="Any specific requirements..."
                        value={specialInstructions}
                        onChange={(e) => setSpecialInstructions(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </motion.div>
                )}

                {step === 'confirm' && (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Date</span>
                        <span className="font-medium">
                          {selectedDate && format(selectedDate, 'PPP')}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Time</span>
                        <span className="font-medium">{selectedTime}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Provider</span>
                        <span className="font-medium">{provider.name}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Group Booking</span>
                        <span className="font-medium">{isGroupBooking ? 'Yes' : 'No'}</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-accent/10">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{t('booking.estimatedCost')}</span>
                        <span className="text-2xl font-bold text-accent">₹{estimatedCost}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Based on 2 hours of service
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CreditCard className="w-4 h-4" />
                      Pay after service completion
                    </div>
                  </motion.div>
                )}

                {step === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <div className="w-20 h-20 mx-auto rounded-full success-gradient flex items-center justify-center mb-6">
                      <CheckCircle className="w-10 h-10 text-success-foreground" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Booking Confirmed!</h3>
                    <p className="text-muted-foreground mb-6">
                      Your booking has been sent to {provider.name}. You'll receive a confirmation soon.
                    </p>
                    <Button onClick={handleClose} className="accent-gradient text-accent-foreground">
                      Done
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {step !== 'success' && (
              <div className="p-6 border-t border-border flex gap-3">
                {step !== 'datetime' && (
                  <Button variant="outline" onClick={handleBack} className="flex-1">
                    {t('common.back')}
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="flex-1 accent-gradient text-accent-foreground hover:opacity-90"
                >
                  {isSubmitting ? 'Processing...' : step === 'confirm' ? t('booking.confirmBooking') : t('common.next')}
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
