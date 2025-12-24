---
title: kafka的安装、集成、事务管理
tags: [kafka]
categories: [技术分享]
date: 2025-10-01
description: 本文主要介绍kafka的使用，主要包括安装、集成、事务管理等。
---

## docker安装Kafka单点

```bash
# 安装zookeeper
docker run -d --name zookeeper -p 2181:2181 -v /etc/localtime:/etc/localtime wurstmeister/zookeeper
# 安装kafka
docker run -d --name kafka -p 9092:9092 -e KAFKA_BROKER_ID=0 -e KAFKA_ZOOKEEPER_CONNECT=192.168.131.128:2181 -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://192.168.131.128:9092 -e KAFKA_LISTENERS=PLAINTEXT://0.0.0.0:9092 -t wurstmeister/kafka
```

## docker安装Kafka集群

> 服务器至少4g内存

```bash
# 创建一个名为zookeeper_network的docker网络
docker network create zookeeper_network

# 安装zookeeper集群 docker-compose.yml
networks:
  default:
    external:
      name: zookeeper_network
services:
  zoo1:
    image: zookeeper
    restart: always
    container_name: zoo1
    hostname: zoo1
    ports:
      - 2181:2181
    volumes:
      - "./zoo1/data:/data"
      - "./zoo1/datalog:/datalog"
    environment:
      ZOO_MY_ID: 1
      ZOO_SERVERS: server.1=zoo1:2888:3888;2181 server.2=zoo2:2888:3888;2181 server.3=zoo3:2888:3888;2181

  zoo2:
    image: zookeeper
    restart: always
    container_name: zoo2
    hostname: zoo2
    ports:
      - 2182:2181
    volumes:
      - "./zoo2/data:/data"
      - "./zoo2/datalog:/datalog"
    environment:
      ZOO_MY_ID: 2
      ZOO_SERVERS: server.1=zoo1:2888:3888;2181 server.2=zoo2:2888:3888;2181 server.3=zoo3:2888:3888;2181

  zoo3:
    image: zookeeper
    restart: always
    container_name: zoo3
    hostname: zoo3
    ports:
      - 2183:2181
    volumes:
      - "./zoo3/data:/data"
      - "./zoo3/datalog:/datalog"
    environment:
      ZOO_MY_ID: 3
      ZOO_SERVERS: server.1=zoo1:2888:3888;2181 server.2=zoo2:2888:3888;2181 server.3=zoo3:2888:3888;2181
      
# 安装Kafka集群 docker-compose.yml
networks:
  default:
    external:
      name: zookeeper_network
services:
  kafka1:
    image: wurstmeister/kafka
    restart: unless-stopped
    container_name: kafka1
    hostname: kafka1
    ports:
      - "9092:9092"
    external_links:
      - zoo1
      - zoo2
      - zoo3
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_LISTENERS: PLAINTEXT://0.0.0.0:9092
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://192.168.131.128:9092    ## 宿主机IP
      KAFKA_ADVERTISED_HOST_NAME: kafka1
      KAFKA_ADVERTISED_PORT: 9092
      KAFKA_ZOOKEEPER_CONNECT: "zoo1:2181,zoo2:2181,zoo3:2181"
    volumes:
      - "./kafka/kafka1/data/:/kafka"
  kafka2:
    image: wurstmeister/kafka
    restart: unless-stopped
    container_name: kafka2
    hostname: kafka2
    ports:
      - "9093:9092"
    external_links:
      - zoo1
      - zoo2
      - zoo3
    environment:
      KAFKA_BROKER_ID: 2
      KAFKA_LISTENERS: PLAINTEXT://0.0.0.0:9092
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://192.168.131.128:9093    ## 宿主机IP
      KAFKA_ADVERTISED_HOST_NAME: kafka2
      KAFKA_ADVERTISED_PORT: 9093
      KAFKA_ZOOKEEPER_CONNECT: "zoo1:2181,zoo2:2181,zoo3:2181"
    volumes:
      - "./kafka/kafka2/data/:/kafka"
  kafka3:
    image: wurstmeister/kafka
    restart: unless-stopped
    container_name: kafka3
    hostname: kafka3
    ports:
      - "9094:9092"
    external_links:
      - zoo1
      - zoo2
      - zoo3
    environment:
      KAFKA_BROKER_ID: 3
      KAFKA_LISTENERS: PLAINTEXT://0.0.0.0:9092
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://192.168.131.128:9094   ## 宿主机IP
      KAFKA_ADVERTISED_HOST_NAME: kafka3
      KAFKA_ADVERTISED_PORT: 9094
      KAFKA_ZOOKEEPER_CONNECT: "zoo1:2181,zoo2:2181,zoo3:2181"
    volumes:
      - "./kafka/kafka3/data/:/kafka"
  kafka-manager: # Kafka 图形管理界面
    image: sheepkiller/kafka-manager:latest
    restart: unless-stopped
    container_name: kafka-manager
    hostname: kafka-manager
    ports:
      - "9000:9000"
    links:            # 连接本compose文件创建的container
      - kafka1
      - kafka2
      - kafka3
    external_links:   # 连接外部compose文件创建的container
      - zoo1
      - zoo2
      - zoo3
    environment:
      ZK_HOSTS: zoo1:2181,zoo2:2181,zoo3:2181
      KAFKA_BROKERS: kafka1:9092,kafka2:9093,kafka3:9094
```

## Java集成Kafka

> 需要注意版本问题

![](http://127.0.0.1:8080/manage-api/system/file/download?fileId=1998229126783320064)

```XML
<!-- 添加依赖 -->
<dependency>
  <groupId>org.apache.kafka</groupId>
  <artifactId>kafka-clients</artifactId>
  <version>0.10.2.0</version>
</dependency>
```

```Java
// Producer
public class Producer {
    public static String topic = "test";  //定义主题
    public static void main(String[] args) throws InterruptedException {
        Properties p = new Properties();
        p.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "192.168.131.128:9092");//kafka地址，多个地址用逗号分割
        p.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        p.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        KafkaProducer<String, String> kafkaProducer = new KafkaProducer<>(p);
        try {
            while (true) {
                String msg = "Hello," + new Random().nextInt(100);
                ProducerRecord<String, String> record = new ProducerRecord<String, String>(topic, msg);
                kafkaProducer.send(record);
                System.out.println("消息发送成功:" + msg);
                Thread.sleep(500);
            }
        } finally {
            kafkaProducer.close();
        }
    }
}

// Consumer
public class Consumer {
    public static void main(String[] args) {
        Properties p = new Properties();
        p.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "192.168.131.128:9092");
        p.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        p.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        p.put(ConsumerConfig.GROUP_ID_CONFIG, "test");

        KafkaConsumer<String, String> kafkaConsumer = new KafkaConsumer<String, String>(p);
        kafkaConsumer.subscribe(Collections.singletonList(Producer.topic));// 订阅消息

        while (true) {
            ConsumerRecords<String, String> records = kafkaConsumer.poll(100);
            for (ConsumerRecord<String, String> record : records) {
                System.out.println(String.format("topic:%s,offset:%d,消息:%s", //
                        record.topic(), record.offset(), record.value()));
            }
        }
    }
}
```

## Springboot集成Kafka

```XML
<!-- 添加依赖 -->
<dependency>
    <groupId>org.springframework.kafka</groupId>
    <artifactId>spring-kafka</artifactId>
    <version>2.7.0</version>
</dependency>
```

```YAML
// 添加配置
spring.kafka.bootstrap-servers=192.168.131.128:9092
```

```Java
// 测试
@SpringBootApplication
@RestController
public class KafkaSpringbootApplication {
    private static final Logger logger = LoggerFactory.getLogger(KafkaSpringbootApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(KafkaSpringbootApplication.class, args);
    }

    @Autowired
    private KafkaTemplate<Object, Object> template;

    @GetMapping("/send/{input}")
    public void sendFoo(@PathVariable String input) {
        this.template.send("topic_input", input);
    }
    @KafkaListener(id = "webGroup", topics = "topic_input")
    public void listen(String input) {
        logger.info("input value: {}" , input);
    }
}
```

## Spring-kafka-test嵌入式Kafka Server
```XML
<!-- 添加依赖 -->
<dependency>
   <groupId>org.springframework.kafka</groupId>
   <artifactId>spring-kafka-test</artifactId>
   <version>2.2.6.RELEASE</version>
   <scope>test</scope>
</dependency>
```

```Java
// 起四个测试节点，可以直接用
@RunWith(SpringRunner.class)
@SpringBootTest(classes = ApplicationTests.class)
@EmbeddedKafka(count = 4,ports = {9092,9093,9094,9095})
public class ApplicationTests {
    @Test
    public void contextLoads()throws IOException {
        System.in.read();
    }
}

// 配置程序启动时创建topic
@Configuration
public class KafkaConfig {
    @Bean
    public KafkaAdmin admin(KafkaProperties properties){
        KafkaAdmin admin = new KafkaAdmin(properties.buildAdminProperties());
        admin.setFatalIfBrokerNotAvailable(true);
        return admin;
    }
    @Bean
    public NewTopic topic2() {
        return new NewTopic("topic-kl", 1, (short) 1);
    }
}

// 代码逻辑创建topic
@Autowired
private KafkaProperties properties;
@Test
public void testCreateToipc(){
    AdminClient client = AdminClient.create(properties.buildAdminProperties());
    if(client !=null){
        try {
            Collection<NewTopic> newTopics = new ArrayList<>(1);
            newTopics.add(new NewTopic("topic-kl",1,(short) 1));
            client.createTopics(newTopics);
        }catch (Throwable e){
            e.printStackTrace();
        }finally {
            client.close();
        }
    }
}
```

### 发送消息之获取发送结果

```Java
// 获取发送结果、异步获取
template.send("","").addCallback(new ListenableFutureCallback<SendResult<Object, Object>>() {
    @Override
    public void onFailure(Throwable throwable) {
        ......
    }

    @Override
    public void onSuccess(SendResult<Object, Object> objectObjectSendResult) {
        ....
    }
});
// 同步获取
ListenableFuture<SendResult<Object,Object>> future = template.send("topic-kl","kl");
try {
    SendResult<Object,Object> result = future.get();
} catch (Throwable e) {
    e.printStackTrace();
}
```

## Kafka事务消息

```YAML
# 激活Kafka事务特性
spring.kafka.producer.transaction-id-prefix=kafka_tx.
```

```Java
@GetMapping("/send/{input}")
public void sendFoo(@PathVariable String input) {
    template.executeInTransaction(t ->{
        t.send("topic_input","kl");
        if("error".equals(input)){
            throw new RuntimeException("failed");
        }
        t.send("topic_input","ckl");
        return true;
    });
}

// 加事务注解也可以实现
@GetMapping("/send/{input}")
@Transactional(rollbackFor = RuntimeException.class)
public void sendFoo(@PathVariable String input) {
    template.send("topic_input", "kl");
    if ("error".equals(input)) {
        throw new RuntimeException("failed");
    }
    template.send("topic_input", "ckl");
}
```
