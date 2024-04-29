package com.eondevelopers.jozoidegas;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.DeleteObjectRequest;
import com.amazonaws.services.s3.model.ObjectMetadata;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
public class AmazonS3Service {

    @Autowired
    private AmazonS3 amazonS3;

    @Value("${amazon.s3.bucketName}")
    private String bucketName;

    public String uploadFile(MultipartFile file,String folderName) {
        try {
            String fileName = file.getOriginalFilename();
            String objectKey = folderName + "/" + fileName;

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

    public void deleteImageFromS3(String imageUrl) {
        try {
            String key = imageUrl.substring(imageUrl.indexOf("Images"));
            amazonS3.deleteObject(new DeleteObjectRequest(bucketName, key));
            System.out.println("Deleted image from S3: " + key);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

