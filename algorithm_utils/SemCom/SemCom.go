package SemCom

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"os"
)

type Config_path struct {
	Transmitted_files string `json:"transmitted_files"`
	Received_files    string `json:"received_files"`
	Local_ip          string `json:"local_ip"`
	Transmitted_msg   string `json:"transmitted_Msg"`
	Received_msg      string `json:"received_Msg"`
}

type SC_transmitted_message struct {
	Transmitted_file string `json:"transmitted_file"`
	SNR              string `json:"SNR"`
	Channel          string `json:"channel"`
	Modal            string `json:"modal"`
}

var T_Msg SC_transmitted_message

func Laod_config() Config_path {
	var cfg_path Config_path
	cfg_path.Transmitted_files = "static/algorithm/SemCom/Transmitted_files"
	cfg_path.Received_files = "static/algorithm/SemCom/Received_files"
	cfg_path.Local_ip = "algorithm_utils/SemCom/data.json"
	cfg_path.Transmitted_msg = "algorithm_utils/SemCom/SC_T.json"
	cfg_path.Received_msg = "algorithm_utils/SemCom/SC_R.json"
	return cfg_path
}

// Get local address
type Ipconfig struct {
	Ip string `json:"ip"`
}

func Load_ip(ip_path string) Ipconfig {
	var ip_file Ipconfig
	// 打开JSON文件
	jsonFile, err := os.Open(ip_path)
	if err != nil {
		log.Fatalf("Failed to open JSON file: %s", err)
	}
	defer jsonFile.Close()

	// 读取文件内容
	byteValue, err := ioutil.ReadAll(jsonFile)
	if err != nil {
		log.Fatalf("Failed to read JSON file: %s", err)
	}

	// 将JSON内容解析到结构体
	err = json.Unmarshal(byteValue, &ip_file)
	if err != nil {
		log.Fatalf("Failed to unmarshal JSON: %s", err)
	}
	return ip_file
}
