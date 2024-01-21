package com.eondevelopers.jozoidegas;

import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlElementWrapper;
import jakarta.xml.bind.annotation.XmlRootElement;

import java.util.List;
@XmlRootElement(name = "gpx", namespace = "http://www.topografix.com/GPX/1/0")
public class GpxData {

    private String trackName;
    private List<Trkpt> trackPoints;

    public GpxData() {
    }
    @XmlElement(name = "name")
    public String getTrackName() {
        return trackName;
    }
    @XmlElementWrapper(name = "trkseg")
    @XmlElement(name = "trkpt")
    public List<Trkpt> getTrackPoints() {
        return trackPoints;
    }

    public void setTrackName(String trackName) {
        this.trackName = trackName;
    }

    public void setTrackPoints(List<Trkpt> trackPoints) {
        this.trackPoints = trackPoints;
    }

}
