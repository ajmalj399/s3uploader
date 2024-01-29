import React, { useState } from "react";
import Dropzone from "react-dropzone";
import * as S3 from "aws-sdk/clients/s3";
import { Table, Button } from "antd";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend } from "recharts";

// Load environment variables from .env file

// require("dotenv").config();

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [timeData, setTimeData] = useState(null);
  const [voltageData, setVoltageData] = useState(null);

  const [showTable, setShowTable] = useState(false);
  const [showLineChart, setShowLineChart] = useState(false);

  const handleFileChange = (acceptedFiles) => {
    setSelectedFile(acceptedFiles[0]);
    setTimeData(null);
    setVoltageData(null);
  };

  const handleFileUpload = async () => {
    try {
      const config = {
        accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,

        secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
        region: process.env.REACT_APP_AWS_REGION,
      };
      const s3 = new S3(config);

      const params = {
        Bucket: "cavlisensordata",
        Key: selectedFile.name,
        Body: selectedFile,
        ContentType: selectedFile.type,
      };

      await s3.upload(params).promise();

      setUploadStatus("File uploaded successfully!");
      setShowTable(true);

      // Fetch and set the content of the uploaded file
      const fileParams = { Bucket: "cavlisensordata", Key: selectedFile.name };
      const fileData = await s3.getObject(fileParams).promise();
      const content = fileData.Body.toString();
      const parsedData = JSON.parse(content);

      // Set time and voltage data
      setTimeData(parsedData.data[0].timestamps);
      setVoltageData(parsedData.data[0].values);

      setSelectedFile(null);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("Upload failed.");
      setShowTable(false);
    }
  };

  const handleViewLineChart = () => {
    setShowLineChart(true);
  };

  const handleHideLineChart = () => {
    setShowLineChart(false);
  };

  const columns = [
    {
      title: "Time Data",
      dataIndex: "time",
      key: "time",
    },
    {
      title: "Voltage Data",
      dataIndex: "voltage",
      key: "voltage",
    },
  ];

  const dataSource =
    timeData && voltageData
      ? timeData.map((time, index) => ({
          key: index,
          time: time,
          voltage: voltageData[index],
        }))
      : [];

  return (
    <>
      <Dropzone onDrop={handleFileChange}>
        {({ getRootProps, getInputProps }) => (
          <section>
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <p>Drag and drop a JSON file or click to select one.</p>
            </div>
            {selectedFile && <p>File selected: {selectedFile.name}</p>}
            <button onClick={handleFileUpload} disabled={!selectedFile}>
              Upload to S3
            </button>
            {uploadStatus && <p>{uploadStatus}</p>}
          </section>
        )}
      </Dropzone>
      <Button onClick={() => setShowTable(true)}>View Uploaded Data</Button>
      <Button
        onClick={handleViewLineChart}
        disabled={!timeData || !voltageData}
      >
        View Data in Line Chart
      </Button>
      {showTable && (
        <div>
          <Button onClick={() => setShowTable(false)}>Hide Data</Button>
          <Table dataSource={dataSource} columns={columns} />
        </div>
      )}
      {showLineChart && (
        <div>
          <Button onClick={handleHideLineChart}>Hide Line Chart</Button>
          <LineChart width={800} height={400} data={dataSource}>
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="voltage" stroke="#8884d8" />
          </LineChart>
        </div>
      )}
    </>
  );
};

export default FileUpload;
