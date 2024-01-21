package com.eondevelopers.jozoidegas;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.core.io.ClassPathResource;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/trips")
public class TripController {
    @Autowired
    private TripDataService tripDataService;
    @GetMapping
    public ResponseEntity<List<TripData>> getAllTrips(){
        return new ResponseEntity<List<TripData>>(tripDataService.allTrips(), HttpStatus.OK);
    }

    @GetMapping(value = "/{status}", produces = { MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE })
    public ResponseEntity<TripAndGpxDataWrapper> getSingleTrip(@PathVariable String status){
        Optional<List<TripData>> tripDataResult = tripDataService.singleTrip(status);

        String gpxPath = tripDataResult.get().get(0).getGpxPath();
        String gpxString = readGpxFile("static" + gpxPath );
        GpxData gpxData = GpxParser.parseGpx(gpxString);

        TripAndGpxDataWrapper responseWrapper = new TripAndGpxDataWrapper(tripDataResult.orElse(null), gpxData);
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(responseWrapper);
    }

    private String readGpxFile(String filePath) {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(new ClassPathResource(filePath).getInputStream()))) {
            StringBuilder content = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                content.append(line).append("\n");
            }
            return content.toString();
        } catch (IOException e) {
            // Handle exception (e.g., file not found, unable to read)
            e.printStackTrace();
            return "Error reading GPX file";
        }
    }

}
