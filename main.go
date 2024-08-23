package main

import (
	"awesomeProject/algorithm_utils/SemCom"
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"strings"
)

func modifyFileName(filePath string, modal string) string {
	// 获取文件目录和文件名
	dir := filepath.Dir(filePath)
	base := filepath.Base(filePath)

	// 去掉文件名的扩展名
	ext := filepath.Ext(base)
	name := strings.TrimSuffix(base, ext)

	// 构建新的文件名
	newName := ""
	if modal == "video" {
		newName = fmt.Sprintf("%s%s", name, ".txt")
	} else {
		newName = fmt.Sprintf("%s_s.png", name)
	}

	// 返回完整的文件路径
	return filepath.Join(dir, newName)
}

func main() {
	//gin.SetMode(gin.DebugMode)
	//gin.SetMode(gin.ReleaseMode)
	r := gin.Default()

	//// 定义静态文件映射
	r.Static("/static", "static")

	//r.LoadHTMLGlob("static/*.html")
	//r.LoadHTMLFiles(static_file+"/*.html")

	//wait_time := 5

	// ################################### define global map ############################################
	r.GET("/SemCom_SM", func(c *gin.Context) {
		// c.HTML(http.StatusOK, "stylegan.html",nil)
		c.Redirect(http.StatusFound, "/static/SemCom_SM.html")
	})

	r.GET("/", func(c *gin.Context) {
		c.Redirect(http.StatusFound, "/static/SemCom.html")
	})

	r.GET("/SemCom_sender", func(c *gin.Context) {
		c.Redirect(http.StatusFound, "/static/SemCom_sender.html")
	})

	r.GET("/SemCom_receiver", func(c *gin.Context) {
		c.Redirect(http.StatusFound, "/static/SemCom_receiver.html")
	})

	cfg_path := SemCom.Laod_config()
	//########################################## SemCom ###################################################

	r.GET("/SemCom/get_local_address", func(c *gin.Context) {
		ipconfig := SemCom.Load_ip(cfg_path.Local_ip)
		c.JSON(200, gin.H{
			"local_address": ipconfig.Ip,
		})
	})

	//################################ SemCom_T #############################################
	r.POST("/SemCom_T/upload_file/", func(c *gin.Context) {
		upfile, err := c.FormFile("file")
		if err != nil {
			return
		}
		img_name := upfile.Filename
		log.Println(img_name)
		save_pth := path.Join(cfg_path.Transmitted_files, img_name)
		_, err = os.Stat(save_pth)
		if !os.IsNotExist(err) {
			err := os.Remove(save_pth)
			if err != nil {
				return
			}
		}
		err = c.SaveUploadedFile(upfile, save_pth)
		if err != nil {
			return
		}
		c.JSON(200, gin.H{})
	})

	r.POST("/SemCom_T/data_transmition/", func(c *gin.Context) {
		err := c.BindJSON(&SemCom.T_Msg)
		if err != nil {
			log.Println(err)
			return
		}
		//log.Printf("%v",&msg)
		// 写json文件
		_, err = os.Stat(cfg_path.Transmitted_msg)
		var file *os.File
		if err == nil {
			file, err = os.OpenFile(cfg_path.Transmitted_msg, os.O_WRONLY|os.O_TRUNC, 0666)
			if err != nil {
				log.Println(err)
			}
		} else {
			file, err = os.Create(cfg_path.Transmitted_msg)
			if err != nil {
				log.Println(err)
			}
		}
		enc := json.NewEncoder(file)
		err = enc.Encode(SemCom.T_Msg)
		if err != nil {
			log.Println(err)
		}
		err = file.Close()
		if err != nil {
			log.Println(err)
		}

		_, err = os.Stat(cfg_path.Received_msg)
		if err == nil {
			file, err = os.OpenFile(cfg_path.Received_msg, os.O_WRONLY|os.O_TRUNC, 0666)
			if err != nil {
				log.Println(err)
			}
		} else {
			file, err = os.Create(cfg_path.Received_msg)
			if err != nil {
				log.Println(err)
			}
		}
		enc = json.NewEncoder(file)
		err = enc.Encode(SemCom.T_Msg)
		if err != nil {
			log.Println(err)
		}
		err = file.Close()
		if err != nil {
			log.Println(err)
		}
		//
		semantic_path := modifyFileName(SemCom.T_Msg.Transmitted_file, SemCom.T_Msg.Modal)
		log.Println(SemCom.T_Msg.Modal, semantic_path)
		for {
			_, err = os.Stat(filepath.Join("static", semantic_path))
			if err == nil {
				break
			}
		}
		//time.Sleep(time.Duration(1) * time.Second)
		c.JSON(200, gin.H{
			"semantics": semantic_path,
		})
	})

	//################################ SemCom_R #############################################
	r.GET("/SemCom_R/get_receiver_info/", func(c *gin.Context) {
		// 打开JSON文件
		jsonFile, err := os.Open(cfg_path.Received_msg)
		if err != nil {
			log.Println(err)
		}
		defer jsonFile.Close()

		// 读取文件内容
		byteValue, err := ioutil.ReadAll(jsonFile)
		if err != nil {
			log.Println(err)
		}

		// 解析JSON数据
		var R_msg SemCom.SC_transmitted_message
		if err := json.Unmarshal(byteValue, &R_msg); err != nil {
			log.Println(err)
		}
		fmt.Printf("file: %s\n", R_msg.Transmitted_file)
		fmt.Printf("snr: %s\n", R_msg.SNR)
		fmt.Printf("channel: %s\n", R_msg.Channel)
		// 获取文件目录和文件名
		dir := filepath.Dir(R_msg.Transmitted_file)
		base := filepath.Base(R_msg.Transmitted_file)

		// 去掉文件名的扩展名
		ext := filepath.Ext(base)
		name := strings.TrimSuffix(base, ext)
		rec_name := fmt.Sprintf("%s_%s_%s%s", name, R_msg.Channel, R_msg.SNR, ext)
		var R_d = filepath.Join(dir, rec_name)
		R_d = strings.Replace(R_d, "Transmitted_files", "Received_files", -1)
		var semantic_path = modifyFileName(R_msg.Transmitted_file, R_msg.Modal)
		semantic_path = strings.Replace(semantic_path, "Transmitted_files", "Received_files", -1)

		c.JSON(200, gin.H{
			"semantics": semantic_path,
			"r_data":    R_d,
			"snr":       R_msg.SNR,
			"channel":   R_msg.Channel,
		})
	})
	err := r.Run(":80")
	if err != nil {
		return
	}
}
