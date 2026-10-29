package com.smartpark.scheduler;

import com.smartpark.entity.Booking;
import com.smartpark.entity.ParkingSlot;
import com.smartpark.entity.enums.BookingStatus;
import com.smartpark.entity.enums.NotificationType;
import com.smartpark.entity.enums.SlotStatus;
import com.smartpark.repository.BookingRepository;
import com.smartpark.repository.ParkingSlotRepository;
import com.smartpark.service.AuditService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class BookingExpiryScheduler {

    private static final Logger log = LoggerFactory.getLogger(BookingExpiryScheduler.class);

    private final BookingRepository bookingRepository;
    private final ParkingSlotRepository slotRepository;
    private final AuditService auditService;

    public BookingExpiryScheduler(BookingRepository bookingRepository,
                                  ParkingSlotRepository slotRepository,
                                  AuditService auditService) {
        this.bookingRepository = bookingRepository;
        this.slotRepository = slotRepository;
        this.auditService = auditService;
    }

    /**
     * Runs every minute to expire confirmed bookings whose end time has passed.
     */
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void processExpiredBookings() {
        LocalDateTime now = LocalDateTime.now();
        List<Booking> expiredBookings = bookingRepository.findExpiredBookings(now);

        for (Booking booking : expiredBookings) {
            if (booking.getStatus() == BookingStatus.CONFIRMED && booking.getEndTime().isBefore(now)) {
                booking.setStatus(BookingStatus.EXPIRED);
                bookingRepository.save(booking);

                ParkingSlot slot = booking.getSlot();
                if (slot.getStatus() == SlotStatus.RESERVED) {
                    slot.setStatus(SlotStatus.AVAILABLE);
                    slotRepository.save(slot);
                }

                auditService.log(null, "BOOKING_EXPIRED", "BOOKING", booking.getId(), "ref=" + booking.getBookingReference());
                auditService.notify(booking.getUser(),
                        "Booking " + booking.getBookingReference() + " has expired.",
                        NotificationType.BOOKING_CANCELLED);

                log.info("Booking {} marked as EXPIRED", booking.getBookingReference());
            }
        }
    }
}
