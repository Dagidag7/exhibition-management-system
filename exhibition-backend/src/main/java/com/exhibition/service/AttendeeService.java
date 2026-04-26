package com.exhibition.service;

import com.exhibition.model.Attendee;
import io.vertx.core.AsyncResult;
import io.vertx.core.Handler;
import java.util.List;

public interface AttendeeService {
    void registerAttendee(Attendee attendee, Handler<AsyncResult<Void>> resultHandler);
    void getAttendee(int id, Handler<AsyncResult<Attendee>> resultHandler);
    void listAttendees(Handler<AsyncResult<List<Attendee>>> resultHandler);
    void updateAttendee(Attendee attendee, Handler<AsyncResult<Void>> resultHandler);
    void removeAttendee(int id, Handler<AsyncResult<Void>> resultHandler);
    void updateAttendeePassword(int attendeeId, String password, Handler<AsyncResult<Void>> resultHandler);
    void updatePaymentFeeByEmail(String email, Double paymentFee, Handler<AsyncResult<Void>> resultHandler);
}