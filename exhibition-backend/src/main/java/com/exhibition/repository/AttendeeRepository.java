package com.exhibition.repository;

import com.exhibition.model.Attendee;
import io.vertx.core.Handler;
import io.vertx.core.AsyncResult;
import java.util.List;

public interface AttendeeRepository {
    void addAttendee(Attendee attendee, Handler<AsyncResult<Void>> resultHandler);
    void getAttendeeById(int id, Handler<AsyncResult<Attendee>> resultHandler);
    void getAllAttendees(Handler<AsyncResult<List<Attendee>>> resultHandler);
    void updateAttendee(Attendee attendee, Handler<AsyncResult<Void>> resultHandler);
    void deleteAttendee(int id, Handler<AsyncResult<Void>> resultHandler);
    void getAttendeeByEmail(String email, Handler<AsyncResult<Attendee>> resultHandler);
    void updateAttendeePassword(int attendeeId, String password, Handler<AsyncResult<Void>> resultHandler);
    void updateAttendeePasswordWithTemporaryFlag(int attendeeId, String password, boolean isTemporary, Handler<AsyncResult<Void>> resultHandler);
    void updatePaymentFeeByEmail(String email, Double paymentFee, Handler<AsyncResult<Void>> resultHandler);
}