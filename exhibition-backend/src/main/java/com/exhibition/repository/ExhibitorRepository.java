package com.exhibition.repository;

import com.exhibition.model.Exhibitor;
import io.vertx.core.AsyncResult;
import io.vertx.core.Handler;

import java.util.List;

public interface ExhibitorRepository {
    void isBoothTaken(String floorNumber, String boothNumber, Integer excludeExhibitorId, Handler<AsyncResult<Boolean>> resultHandler);
    void getFloorExhibitorCount(String floorNumber, Handler<AsyncResult<Integer>> resultHandler);
    void addExhibitor(Exhibitor exhibitor, Handler<AsyncResult<Integer>> resultHandler);
    void getExhibitorById(int id, Handler<AsyncResult<Exhibitor>> resultHandler);
    void getAllExhibitors(Handler<AsyncResult<List<Exhibitor>>> resultHandler);
    void updateExhibitor(Exhibitor exhibitor, Handler<AsyncResult<Void>> resultHandler);
    void deleteExhibitor(int id, Handler<AsyncResult<Void>> resultHandler);
    void updateExhibitorPassword(int exhibitorId, String password, Handler<AsyncResult<Void>> resultHandler);
    void updateExhibitorPasswordWithTemporaryFlag(int exhibitorId, String password, boolean isTemporary, Handler<AsyncResult<Void>> resultHandler);
    void getExhibitorByEmail(String email, Handler<AsyncResult<Exhibitor>> resultHandler);
}