package com.exhibition.service;

import com.exhibition.model.Exhibitor;
import io.vertx.core.AsyncResult;
import io.vertx.core.Handler;
import java.util.List;

public interface ExhibitorService {
    void registerExhibitor(Exhibitor exhibitor, Handler<AsyncResult<Integer>> resultHandler);
    void getExhibitor(int id, Handler<AsyncResult<Exhibitor>> resultHandler);
    void listExhibitors(Handler<AsyncResult<List<Exhibitor>>> resultHandler);
    void updateExhibitor(Exhibitor exhibitor, Handler<AsyncResult<Void>> resultHandler);
    void removeExhibitor(int id, Handler<AsyncResult<Void>> resultHandler);
    void updateExhibitorPassword(int exhibitorId, String password, Handler<AsyncResult<Void>> resultHandler);
    void getExhibitorByEmail(String email, Handler<AsyncResult<Exhibitor>> resultHandler);
    void getFloorExhibitorCount(String floorNumber, Handler<AsyncResult<Integer>> resultHandler);
    void resetExhibitorPassword(String email, Handler<AsyncResult<String>> resultHandler);
    void sendPaymentRequestEmail(String email, String companyName, String paymentLink, Handler<AsyncResult<Void>> resultHandler);
}
