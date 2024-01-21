package com.eondevelopers.jozoidegas;

import java.util.List;

public class TripAndGpxDataWrapper {
    private List<TripData> tripDataList;
    private GpxData gpxData;

    // constructors, getters, and setters

    public TripAndGpxDataWrapper(List<TripData> tripDataList, GpxData gpxData) {
        this.tripDataList = tripDataList;
        this.gpxData = gpxData;
    }

    public List<TripData> getTripDataList() {
        return tripDataList;
    }

    public void setTripDataList(List<TripData> tripDataList) {
        this.tripDataList = tripDataList;
    }

    public GpxData getGpxData() {
        return gpxData;
    }

    public void setGpxData(GpxData gpxData) {
        this.gpxData = gpxData;
    }
}
