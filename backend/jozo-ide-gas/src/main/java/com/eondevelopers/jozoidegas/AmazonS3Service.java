package com.eondevelopers.jozoidegas;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.DeleteObjectRequest;
import com.amazonaws.services.s3.model.ObjectMetadata;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class AmazonS3Service {

    private static final Logger log = LoggerFactory.getLogger(AmazonS3Service.class);

    @Autowired
    private AmazonS3 amazonS3;

    @Value("${amazon.s3.bucketName}")
    private String bucketName;

    public String uploadFile(MultipartFile file,String folderName) {
        try {
            String objectKey = folderName + "/" + uniqueFileName(file.getOriginalFilename());

            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentType(file.getContentType());
            metadata.setContentLength(file.getSize());
            amazonS3.putObject(bucketName, objectKey, file.getInputStream(), metadata);
            return amazonS3.getUrl(bucketName, objectKey).toString();
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Phone filenames repeat constantly - every trip has an IMG_0042.jpg - so using the name
     * as-is let one ride overwrite another ride's photo, and deleting either one then took
     * the survivor's image with it. The random prefix keeps every upload distinct, and the
     * sanitising keeps the key free of characters that would be escaped in the returned URL
     * (which is what delete later parses the key back out of).
     */
    private String uniqueFileName(String originalName) {
        String cleaned = originalName == null ? "" : originalName.replaceAll("[^A-Za-z0-9._-]", "_");
        return UUID.randomUUID() + (cleaned.isEmpty() ? "" : "-" + cleaned);
    }

    public void deleteFromS3(String fileUrl) {
        String key = keyFromUrl(fileUrl);
        if (key == null) {
            log.warn("Skipping S3 delete for unusable url: {}", fileUrl);
            return;
        }
        try {
            amazonS3.deleteObject(new DeleteObjectRequest(bucketName, key));
            log.info("Deleted {} from S3", key);
        } catch (Exception e) {
            log.error("Failed to delete {} from S3", key, e);
        }
    }

    /**
     * Pulls the object key back out of a stored url. Reading the path rather than searching
     * for a known folder name keeps this working for any prefix - videos live under a
     * different one than images - and undoes the percent-encoding the url carries.
     */
    private String keyFromUrl(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) {
            return null;
        }
        try {
            String path = URI.create(fileUrl).getPath();
            if (path == null || path.length() <= 1) {
                return null;
            }
            String key = URLDecoder.decode(path.substring(1), StandardCharsets.UTF_8);
            // Path-style urls put the bucket in front of the key; virtual-hosted ones do not.
            if (key.startsWith(bucketName + "/")) {
                key = key.substring(bucketName.length() + 1);
            }
            return key.isBlank() ? null : key;
        } catch (Exception e) {
            log.warn("Could not read an S3 key out of {}", fileUrl, e);
            return null;
        }
    }
}

