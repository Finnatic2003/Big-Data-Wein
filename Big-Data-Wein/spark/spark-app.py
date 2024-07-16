from pyspark.sql import SparkSession
from pyspark.sql.functions import *
from pyspark.sql.types import IntegerType, StringType, StructType, TimestampType

dbUrl = 'jdbc:mysql://big-data-mariadb-service:3306/popular'
dbOptions = {"user": "root", "password": "ePddAss2024"}
dbSchema = 'logs'

windowDuration = '1 minute'
slidingDuration = '1 minute'

# Create a spark session
spark = SparkSession.builder \
    .appName("Use Case").getOrCreate()

# Set log level
spark.sparkContext.setLogLevel('WARN')

# Read messages from Kafka
kafkaMessages = spark \
    .readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers",
            "my-cluster-kafka-bootstrap:9092") \
    .option("subscribe", "tracking-data") \
    .option("startingOffsets", "earliest") \
    .load()

# Define schema of tracking data
trackingMessageSchema = StructType() \
    .add("wein", StringType()) \
    .add("timestamp", IntegerType())

# Convert value: binary -> JSON -> fields + parsed timestamp
trackingMessages = kafkaMessages.select(
    # Extract 'value' from Kafka message (i.e., the tracking data)
    from_json(
        column("value").cast("string"),
        trackingMessageSchema
    ).alias("json")
).select(
    # Convert Unix timestamp to TimestampType
    from_unixtime(column('json.timestamp'))
    .cast(TimestampType())
    .alias("parsed_timestamp"),

    # Select all JSON fields
    column("json.*")
) \
    .withColumnRenamed('json.wein', 'wein') \
    .withWatermark("parsed_timestamp", windowDuration)

# Compute most popular slides
popular = trackingMessages.groupBy(
    window(
        column("parsed_timestamp"),
        windowDuration,
        slidingDuration
    ),
    column("wein")
).count() \
 .withColumnRenamed('window.start', 'window_start') \
 .withColumnRenamed('window.end', 'window_end') \

# Start running the query; print running counts to the console
consoleDump = popular \
    .writeStream \
    .outputMode("update") \
    .format("console") \
    .start()

# Example Part 6


def saveToDatabase(batchDataframe, batchId):
    global dbUrl, dbSchema, dbOptions
    print(batchDataframe)
    print(f"Writing batchID {batchId} to database @ {dbUrl}")
    batchDataframe.distinct().write.jdbc(dbUrl, dbSchema, "append", dbOptions)


# Example Part 7
dbInsertStream = popular \
    .select(column('wein'), column('count')) \
    .writeStream \
    .outputMode("complete") \
    .foreachBatch(saveToDatabase) \
    .start()

# Wait for termination
spark.streams.awaitAnyTermination()
