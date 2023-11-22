import { View, Text, Image, Touchable, TouchableOpacity } from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import { ScrollView } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { BellIcon, MagnifyingGlassIcon } from "react-native-heroicons/outline";
import { TextInput } from "react-native";
import axios from "axios";
import { debounce } from "lodash";

import Categories from "../components/categories";
import Recipes from "../components/recipes";
import Loading from "../components/loading";
import { XMarkIcon } from "react-native-heroicons/solid";

export default function HomeScreen() {
  const [activeCategory, setActiveCategory] = useState("Beef");
  const [categories, setCategories] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cancelToken, setCancelToken] = useState(null);
  const debouncedSearchRef = useRef(null);
  const handleChangeCategory = (category) => {
    getRecipes(category);
    setActiveCategory(category);
    setRecipes([]);
  };
  const getCategories = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        "https://themealdb.com/api/json/v1/1/categories.php"
      );
      if (response && response.data) {
        setCategories(response.data.categories);
      }
    } catch (err) {
      console.log("error: ", err.message);
    } finally {
      setIsLoading(false);
    }
  };
  const getRecipes = async (category = "Beef") => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `https://themealdb.com/api/json/v1/1/filter.php?c=${category}`
      );
      if (response && response.data) {
        setRecipes(response.data.meals);
      }
    } catch (err) {
      console.log("error: ", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const searchRecipes = async (query) => {
    if (!query) {
      setIsLoading(false);
      setRecipes([]); // Réinitialisez les recettes pour les recherches vides
      return;
    }
    if (cancelToken) {
      cancelToken.cancel("New search query entered");
    }
    const newCancelToken = axios.CancelToken.source();
    setCancelToken(newCancelToken);

    try {
      setIsLoading(true);
      setRecipes([]); // Réinitialisez les recettes avant de commencer une nouvelle recherche
      const formattedQuery = query.replace(/\s/g, "").toLowerCase();
      const response = await axios.get(
        `https://themealdb.com/api/json/v1/1/search.php?s=${formattedQuery}`,
        {
          cancelToken: newCancelToken.token,
        }
      );
      if (response && response.data) {
        setRecipes(response.data.meals);
        filterCategories(response.data.meals);
      }
    } catch (err) {
      if (axios.isCancel(err)) {
        console.log("Request canceled:", err.message);
      } else {
        console.log("error: ", err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query) => {
    if (debouncedSearchRef.current) {
      debouncedSearchRef.current.cancel(); // Annuler la recherche précédente
    }
    debouncedSearchRef.current = debounce(() => {
      searchRecipes(query);
    }, 2000);
    debouncedSearchRef.current(); // Appeler la recherche débouncée
  };

  useEffect(() => {
    getCategories();
    getRecipes();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      handleSearch(searchTerm);
    } else if (searchTerm === "") {
      setIsLoading(false);
      getRecipes(activeCategory);
      if (cancelToken) {
        cancelToken.cancel("Search term cleared");
      }
    }
  }, [searchTerm]);

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 50,
        }}
        className="space-y-6 pt-14"
      >
        {/* avatar and bell icon */}
        <View className="mx-4 flex-row justify-between items-center mb-2">
          <Image
            source={require("../../assets/images/avatar.png")}
            style={{
              height: hp(5),
              width: hp(5.5),
            }}
          />
          <BellIcon size={hp(4)} color="gray" />
        </View>

        {/* greetings and punchline */}
        <View className="mx-4 space-y-2 mb-2">
          <Text style={{ fontSize: hp(2) }} className="text-neutral-600">
            Hello, Jean !
          </Text>
          <View>
            <Text
              style={{ fontSize: hp(3.8) }}
              className="text-neutral-600 font-semibold"
            >
              Make your own food,
            </Text>
          </View>
          <Text
            style={{ fontSize: hp(3.8) }}
            className="text-neutral-600 font-semibold"
          >
            stay at <Text className="text-amber-400">home</Text>
          </Text>
        </View>

        {/* search bar */}
        <View className="mx-4 flex-row items-center rounded-full bg-black/5 p-[6px]">
          <TextInput
            value={searchTerm}
            onChangeText={(text) => {
              setSearchTerm(text);
              if (text.length >= 1) {
                setIsLoading(true);
              } else {
                setIsLoading(false);
                if (cancelToken) {
                  cancelToken.cancel("Search term too short");
                }
              }
            }}
            placeholder="Search any recipe"
            placeholderTextColor="gray"
            style={{ fontSize: hp(1.7) }}
            className="flex-1 text-base mb-1 pl-3 tracking-wider"
          />
          <TouchableOpacity
            disabled={isLoading || searchTerm.length === 0}
            onPress={() => setSearchTerm("")}
          >
            <View className="bg-white rounded-full p-3">
              <XMarkIcon size={hp(4)} color="red" />
            </View>
          </TouchableOpacity>
        </View>

        {/* categories */}

        {categories && categories?.length > 0 && (
          <View style={{ height: hp(10) }}>
            <Categories
              categories={categories}
              activeCategory={activeCategory}
              handleChangeCategory={handleChangeCategory}
            />
          </View>
        )}

        {/* recipes */}
        <View>
          {isLoading ? (
            <Loading size="large" className="mt-20" color="#f59e0b" />
          ) : recipes?.length > 0 ? (
            <Recipes categories={categories} recipes={recipes} />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Text
                style={{ fontSize: hp(2.5) }}
                className="text-neutral-600 font-semibold"
              >
                No recipes found
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
