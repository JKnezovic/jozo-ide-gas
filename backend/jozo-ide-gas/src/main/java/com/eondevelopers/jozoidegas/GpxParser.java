package com.eondevelopers.jozoidegas;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.ByteArrayInputStream;
import java.util.ArrayList;
import java.util.List;

public class GpxParser {

    public static GpxData parseGpx(String gpxXml) {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            ByteArrayInputStream input = new ByteArrayInputStream(gpxXml.getBytes());
            Document document = builder.parse(input);

            GpxData gpxData = new GpxData();
            gpxData.setTrackName(getElementTextByTagName(document, "name"));
            gpxData.setTrackPoints(parseTrkpts(document));

            return gpxData;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    private static String getElementTextByTagName(Document document, String tagName) {
        NodeList nodeList = document.getElementsByTagName(tagName);
        if (nodeList.getLength() > 0) {
            return nodeList.item(0).getTextContent();
        }
        return null;
    }

    private static List<Trkpt> parseTrkpts(Document document) {
        List<Trkpt> trkpts = new ArrayList<>();
        NodeList trkptNodes = document.getElementsByTagName("trkpt");
        for (int i = 0; i < trkptNodes.getLength(); i++) {
            Element trkptElement = (Element) trkptNodes.item(i);
            double lat = Double.parseDouble(trkptElement.getAttribute("lat"));
            double lon = Double.parseDouble(trkptElement.getAttribute("lon"));
            Trkpt trkpt = new Trkpt();
            trkpt.setLat(lat);
            trkpt.setLon(lon);
            trkpts.add(trkpt);
        }
        return trkpts;
    }
}

